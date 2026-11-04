'use client';

import React, { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   WashTransition: the wash, ported from design/js/transition.js.

   A foam sheet is already down on first paint, with suds drifting
   through it, water streaking down it and bubbles rising. It counts
   up, then a squeegee blade pulls the sheet off top to bottom,
   dragging a wave of foam along its edge and leaving drips behind.

   Two deliberate changes from the prototype:

   - It plays once per browser session. The prototype replayed it on
     every move between artboards, which was the point there; on a
     real site a full curtain on every visit is a tax on the person
     reading it, so a repeat load inside the same session skips it.
   - The curtain is rendered by the server already covering the
     screen, so there is no frame of bare content before it lands.
     <noscript> removes it entirely, otherwise a reader without
     JavaScript would be stuck behind it.

   Hand-rolled rather than framer-motion on purpose: it drives
   clip-path percentages and spawns drips off the blade edge, which
   needs the frame callback.
   ═══════════════════════════════════════════════════════════ */

const SESSION_KEY = 'md-washed';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* Seeded so the server and the client lay the bubbles out identically.
   Math.random() here would be a hydration mismatch, and it would also
   mean no bubbles at all until the effect had run. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BUBBLES = (() => {
  const r = seeded(20260227);
  return Array.from({ length: 28 }, () => {
    const size = 5 + r() * 26;
    return {
      width: size.toFixed(0) + 'px',
      height: size.toFixed(0) + 'px',
      left: (r() * 100).toFixed(1) + '%',
      ['--d' as string]: (5 + r() * 6).toFixed(1) + 's',
      ['--delay' as string]: (-r() * 8).toFixed(1) + 's',
      ['--sway' as string]: (r() * 46 - 23).toFixed(0) + 'px',
    } as React.CSSProperties;
  });
})();

export function WashTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dripsRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      /* private mode can throw on access; treat it as a first visit */
    }

    const clear = () => {
      el.classList.remove('is-on', 'is-intro', 'is-wiping');
      el.style.setProperty('--cover', '0%');
      el.style.setProperty('--y', '0%');
      document.documentElement.classList.remove('is-washing');
    };

    if (seen || reduced) {
      clear();
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* nothing to do: it just plays again next time */
    }

    document.documentElement.classList.add('is-washing');
    el.classList.add('is-on', 'is-intro');

    let raf = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = (ms: number, ease: (t: number) => number, onFrame: (v: number) => void) =>
      new Promise<void>((resolve) => {
        const t0 = performance.now();
        const frame = (now: number) => {
          if (cancelled) return resolve();
          const p = Math.min(1, (now - t0) / ms);
          onFrame(ease(p));
          if (p < 1) raf = requestAnimationFrame(frame);
          else resolve();
        };
        raf = requestAnimationFrame(frame);
      });

    const wait = (ms: number) =>
      new Promise<void>((r) => {
        timers.push(setTimeout(r, ms));
      });

    /* a drop of water left hanging off the blade */
    const dripAt = (yPct: number) => {
      const drips = dripsRef.current;
      if (!drips) return;
      const d = document.createElement('i');
      d.className = 'drip';
      d.style.left = (Math.random() * 100).toFixed(1) + '%';
      d.style.top = yPct.toFixed(2) + '%';
      d.style.setProperty('--w', (2 + Math.random() * 4).toFixed(1) + 'px');
      d.style.setProperty('--h', (50 + Math.random() * 170).toFixed(0) + 'px');
      d.style.setProperty('--d', (0.7 + Math.random() * 0.8).toFixed(2) + 's');
      drips.appendChild(d);
      timers.push(setTimeout(() => d.remove(), 1800));
    };

    /* the squeegee pulls the sheet down and off */
    const wipe = () => {
      el.classList.add('is-wiping');
      el.style.setProperty('--cover', '100%');
      let lastDrip = 0;
      return run(1050, easeInOut, (v) => {
        const p = v * 100;
        el.style.setProperty('--y', p + '%');
        el.style.setProperty('--edge', p + '%');
        if (p - lastDrip > 4 && p < 94) {
          lastDrip = p;
          dripAt(p);
        }
      }).then(() => {
        el.classList.remove('is-on', 'is-wiping', 'is-intro');
        el.style.setProperty('--cover', '0%');
        el.style.setProperty('--y', '0%');
        document.documentElement.classList.remove('is-washing');
        timers.push(
          setTimeout(() => {
            if (dripsRef.current) dripsRef.current.innerHTML = '';
          }, 1600)
        );
      });
    };

    run(1250, easeOut, (v) => {
      if (numRef.current) numRef.current.textContent = String(Math.round(v * 100));
    })
      .then(() => wait(200))
      .then(wipe);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.documentElement.classList.remove('is-washing');
    };
  }, []);

  return (
    <>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: '.wash{display:none!important}' }} />
      </noscript>
      <div
        className="wash is-on is-intro"
        ref={rootRef}
        aria-hidden="true"
        style={{ ['--cover' as string]: '100%', ['--y' as string]: '0%' }}
      >
        <div className="wash__sheet">
          <div className="wash__foam" />
          <div className="wash__bubbles">
            {BUBBLES.map((style, i) => (
              <i key={i} className="bub" style={style} />
            ))}
          </div>
          <div className="wash__streaks" />
        </div>

        <div className="wash__blade">
          <div className="wash__wave" />
          <div className="wash__glow" />
        </div>

        <div className="wash__drips" ref={dripsRef} />

        <div className="wash__count">
          <div className="wash__num">
            <span ref={numRef}>0</span>
            <i>%</i>
          </div>
          <div className="wash__word">MDetailing</div>
        </div>
      </div>
    </>
  );
}
