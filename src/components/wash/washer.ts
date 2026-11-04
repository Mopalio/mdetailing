/* ═══════════════════════════════════════════════════════════════
   washer.ts — the pressure washer.

   A canvas holds a dulled, grimy copy of the hero photo. It is
   erased with destination-out so the clean image underneath shows
   through. The input model is "hold and aim": a lance fires from
   the bottom of the frame at wherever you point, with mist and a
   narrow high-power footprint.

   Ported from design/js/washer.js (the `jet` mode). Two things in
   it are load-bearing and are kept exactly as they were:

   1. Progress is a coverage grid, not getImageData. Reading canvas
      pixels throws once a cross-origin or file-origin image has
      been drawn, so coverage is tracked in a Uint8Array instead.
   2. The canvas sizes itself from offsetWidth, not from
      getBoundingClientRect, so a CSS transform on an ancestor
      cannot make it paint at the wrong resolution.

   Framework-agnostic on purpose: it takes elements and returns a
   teardown, so React only has to own the markup.
   ═══════════════════════════════════════════════════════════ */

export interface WasherElements {
  frame: HTMLElement;
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  shine: HTMLElement | null;
  suds: HTMLElement | null;
  tool: HTMLElement | null;
  hint: HTMLElement | null;
  done: HTMLElement | null;
}

export interface WasherOptions {
  /** called with 0..100 whenever coverage changes */
  onProgress?: (percent: number) => void;
  /** called once the car is clean and the shine has swept */
  onFinish?: () => void;
}

export interface WasherHandle {
  reset: () => void;
  destroy: () => void;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** the fraction of the car that has to be clean before it rinses itself */
const FINISH_AT = 0.6;

/** coverage grid resolution */
const GX = 46;
const GY = 32;

export function mountWasher(els: WasherElements, opts: WasherOptions = {}): WasherHandle {
  const { frame, image, canvas, shine, suds: sudsEl, tool: toolEl, hint, done } = els;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { reset: () => {}, destroy: () => {} };
  }

  const reduced = prefersReduced();

  let grid = new Uint8Array(GX * GY);
  let cleaned = 0;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let pressed = false;
  let finished = false;
  let lastSud = 0;
  /* two handles on purpose: letting go of the trigger cancels the jet
     loop, and must not touch the rinse that finish() is running */
  let jetRaf = 0;
  let finishRaf = 0;
  let aim: { x: number; y: number } | null = null;
  let destroyed = false;
  let jetEl: HTMLElement | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };

  /* ── the dirt ───────────────────────────────────────────── */

  function containRect(iw: number, ih: number, w: number, h: number, posY: number, cover: boolean) {
    const s = cover ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
    const dw = iw * s;
    const dh = ih * s;
    return { x: (w - dw) / 2, y: (h - dh) * posY, w: dw, h: dh };
  }

  function paintDirt() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);

    if (image.complete && image.naturalWidth) {
      const cover = getComputedStyle(image).objectFit === 'cover';
      const r = containRect(
        image.naturalWidth,
        image.naturalHeight,
        W,
        H,
        cover ? 0.5 : 0.58,
        cover
      );
      ctx.filter = 'grayscale(.5) sepia(.42) brightness(.4) contrast(1.05)';
      ctx.drawImage(image, r.x, r.y, r.w, r.h);
      ctx.filter = 'none';
    }

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'rgba(38,34,27,.96)');
    bg.addColorStop(0.55, 'rgba(49,43,33,.92)');
    bg.addColorStop(1, 'rgba(28,25,20,.97)');
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = 'rgba(86,76,58,.34)';
    ctx.fillRect(0, 0, W, H);

    const blobs = Math.round((W * H) / 14000);
    for (let i = 0; i < blobs; i++) {
      const x = rnd(-40, W + 40);
      const y = rnd(-20, H + 20);
      const r = rnd(26, 120);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tone = ['120,106,80', '92,82,62', '142,126,96', '70,62,47'][(Math.random() * 4) | 0];
      g.addColorStop(0, 'rgba(' + tone + ',' + rnd(0.14, 0.4).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(' + tone + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    /* rain streaks */
    for (let i = 0; i < 34; i++) {
      const x = rnd(0, W);
      const w = rnd(1.5, 6);
      const h = rnd(H * 0.2, H * 0.85);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(150,134,102,.24)');
      g.addColorStop(1, 'rgba(150,134,102,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, rnd(-20, H * 0.25), w, h);
    }

    const specks = Math.round((W * H) / 900);
    for (let i = 0; i < specks; i++) {
      ctx.fillStyle = 'rgba(176,160,124,' + rnd(0.08, 0.42).toFixed(2) + ')';
      const s = rnd(0.7, 2.6);
      ctx.fillRect(rnd(0, W), rnd(0, H), s, s);
    }

    const vig = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.22,
      W / 2, H / 2, Math.max(W, H) * 0.72
    );
    vig.addColorStop(0, 'rgba(50,44,33,0)');
    vig.addColorStop(1, 'rgba(40,35,26,.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── sizing ─────────────────────────────────────────────── */

  function size(force: boolean) {
    /* offsetWidth, not the bounding rect: the rect reports the
       post-transform size, which would paint grime at the wrong
       resolution under any scaled ancestor */
    const nw = Math.round(frame.offsetWidth);
    const nh = Math.round(frame.offsetHeight);
    if (!nw || !nh) return;
    if (!force && nw === W && nh === H) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = nw;
    H = nh;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    restart();
  }

  function restart() {
    grid = new Uint8Array(GX * GY);
    cleaned = 0;
    finished = false;
    cancelAnimationFrame(jetRaf);
    cancelAnimationFrame(finishRaf);
    pressed = false;
    aim = null;
    paintDirt();
    report();
    done?.classList.remove('go');
    shine?.classList.remove('go');
    hint?.classList.remove('gone');
    jetEl?.classList.remove('on');
  }

  /* ── erasing ────────────────────────────────────────────── */

  function mark(x: number, y: number, rx: number, ry: number) {
    const cw = W / GX;
    const ch = H / GY;
    const i0 = Math.max(0, Math.floor((x - rx) / cw));
    const i1 = Math.min(GX - 1, Math.floor((x + rx) / cw));
    const j0 = Math.max(0, Math.floor((y - ry) / ch));
    const j1 = Math.min(GY - 1, Math.floor((y + ry) / ch));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const k = j * GX + i;
        if (grid[k]) continue;
        const dx = ((i + 0.5) * cw - x) / rx;
        const dy = ((j + 0.5) * ch - y) / ry;
        if (dx * dx + dy * dy <= 1) {
          grid[k] = 1;
          cleaned++;
        }
      }
    }
  }

  function cut() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'none';
  }

  function uncut() {
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
  }

  function dab(x: number, y: number, r: number, hard?: boolean) {
    if (!ctx) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(hard ? 0.82 : 0.55, 'rgba(0,0,0,' + (hard ? 0.98 : 0.92) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  /* ── froth and spray ────────────────────────────────────── */

  function suds(x: number, y: number, r: number, n?: number) {
    if (reduced || !sudsEl) return;
    const now = performance.now();
    if (now - lastSud < 46) return;
    lastSud = now;
    const count = n || 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < count; i++) {
      const b = document.createElement('i');
      const s = rnd(6, 20);
      b.className = 'sud';
      b.style.cssText =
        'width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) +
        'px;left:' + (x + rnd(-r * 0.5, r * 0.5)).toFixed(0) +
        'px;top:' + (y + rnd(-r * 0.5, r * 0.5)).toFixed(0) +
        'px;--sx:' + rnd(-26, 26).toFixed(0) +
        'px;--sy:' + rnd(-70, -26).toFixed(0) +
        'px;--d:' + rnd(0.9, 1.7).toFixed(2) + 's';
      sudsEl.appendChild(b);
      later(() => b.remove(), 1800);
    }
  }

  function mist(x: number, y: number, ax: number, ay: number) {
    if (reduced || !toolEl) return;
    for (let i = 0; i < 2; i++) {
      const m = document.createElement('i');
      const s = rnd(5, 17);
      m.className = 'mist';
      m.style.cssText =
        'width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) +
        'px;left:' + (x + rnd(-14, 14)).toFixed(0) +
        'px;top:' + (y + rnd(-14, 14)).toFixed(0) +
        'px;--mx:' + (ax * rnd(18, 54)).toFixed(0) +
        'px;--my:' + (ay * rnd(18, 54)).toFixed(0) +
        'px;--d:' + rnd(0.4, 0.9).toFixed(2) + 's';
      toolEl.appendChild(m);
      later(() => m.remove(), 1000);
    }
  }

  /* ── progress ───────────────────────────────────────────── */

  function report() {
    const p = cleaned / (GX * GY);
    const shown = Math.min(100, Math.round(p * 100));
    opts.onProgress?.(finished ? 100 : shown);
    if (!finished && p >= FINISH_AT) finish();
  }

  /** at 60 percent the rest rinses off on its own */
  function finish() {
    finished = true;
    opts.onProgress?.(100);
    hint?.classList.add('gone');
    jetEl?.classList.remove('on');
    cancelAnimationFrame(jetRaf);

    const t0 = performance.now();
    const dur = reduced ? 1 : 620;

    const frameLoop = (now: number) => {
      if (destroyed || !ctx) return;
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const edge = e * (W + 220) - 110;
      cut();
      const g = ctx.createLinearGradient(edge - 150, 0, edge, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, edge, H);
      uncut();
      if (!reduced && p < 0.96 && Math.random() > 0.5) {
        lastSud = 0;
        suds(edge - rnd(0, 90), rnd(0, H), 40);
      }
      if (p < 1) {
        finishRaf = requestAnimationFrame(frameLoop);
      } else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        shine?.classList.add('go');
        later(() => {
          done?.classList.add('go');
          opts.onFinish?.();
        }, 520);
      }
    };
    finishRaf = requestAnimationFrame(frameLoop);
  }

  /* ── the lance ──────────────────────────────────────────── */

  function buildTool() {
    if (!toolEl) return;
    toolEl.insertAdjacentHTML(
      'beforeend',
      '<div class="jet"><div class="jet__fan"></div><div class="jet__nozzle"></div></div>'
    );
    jetEl = toolEl.querySelector('.jet');
  }

  function jetFrame() {
    if (destroyed || !pressed || finished || !aim || !ctx) return;

    /* the lance is anchored just off the bottom edge, centred */
    const ox = W / 2;
    const oy = H + 24;
    const dx = aim.x - ox;
    const dy = aim.y - oy;
    const len = Math.hypot(dx, dy) || 1;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

    if (jetEl) {
      jetEl.style.transform =
        'translate3d(' + ox + 'px,' + oy + 'px,0) rotate(' + ang + 'deg)';
      const fan = jetEl.querySelector<HTMLElement>('.jet__fan');
      if (fan) {
        fan.style.height = Math.max(40, len) + 'px';
        fan.style.width = len * 0.42 + 'px';
        fan.style.marginLeft = -len * 0.21 + 'px';
      }
    }

    /* narrow, high-power footprint where you are pointing, plus a
       thinner scatter along the length of the stream */
    const r = Math.max(16, Math.min(W, H) * 0.072);
    cut();
    dab(aim.x, aim.y, r * 1.1, true);
    for (let i = 0; i < 7; i++) {
      const t = rnd(0.55, 1);
      dab(
        ox + dx * t + rnd(-r, r),
        oy + dy * t + rnd(-r * 0.5, r * 0.5),
        r * rnd(0.22, 0.52)
      );
    }
    uncut();
    mark(aim.x, aim.y, r * 1.2, r * 1.2);

    mist(aim.x, aim.y, -dx / len, -dy / len);
    report();
    /* report() may have finished the wash, which stops the jet */
    if (!finished) jetRaf = requestAnimationFrame(jetFrame);
  }

  /* ── input ──────────────────────────────────────────────── */

  function local(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e: PointerEvent) {
    if (finished) return;
    pressed = true;
    hint?.classList.add('gone');
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety, not a requirement */
    }
    aim = local(e);
    jetEl?.classList.add('on');
    cancelAnimationFrame(jetRaf);
    jetRaf = requestAnimationFrame(jetFrame);
  }

  function onMove(e: PointerEvent) {
    if (finished || !pressed) return;
    aim = local(e);
  }

  function onUp() {
    pressed = false;
    jetEl?.classList.remove('on');
    cancelAnimationFrame(jetRaf);
  }

  /* ── boot ───────────────────────────────────────────────── */

  buildTool();

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onUp);

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => size(false), 180);
  };
  window.addEventListener('resize', onResize);

  const onLoad = () => size(true);
  if (image.complete && image.naturalWidth) size(true);
  else image.addEventListener('load', onLoad);
  image.addEventListener('error', onLoad);

  requestAnimationFrame(() => size(false));

  return {
    reset: restart,
    destroy() {
      destroyed = true;
      window.removeEventListener('resize', onResize);
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onLoad);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      clearTimeout(resizeTimer);
      timers.forEach(clearTimeout);
      timers.clear();
      cancelAnimationFrame(jetRaf);
      cancelAnimationFrame(finishRaf);
      if (toolEl) toolEl.innerHTML = '';
    },
  };
}
