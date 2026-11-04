'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   WashTransition — the wash, ported from design/js/transition.js.

   A foam sheet is already down on first paint. It counts up, then
   a squeegee pulls it off top to bottom, trailing drips.

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

export function WashTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const dripsRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<React.CSSProperties[]>([]);

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

    /* bubbles only exist while the curtain does */
    setBubbles(
      Array.from({ length: 26 }, () => ({
        width: (5 + Math.random() * 26).toFixed(0) + 'px',
        height: (5 + Math.random() * 26).toFixed(0) + 'px',
        left: (Math.random() * 100).toFixed(1) + '%',
        ['--d' as string]: (5 + Math.random() * 6).toFixed(1) + 's',
        ['--delay' as string]: (-Math.random() * 8).toFixed(1) + 's',
        ['--sway' as string]: (Math.random() * 46 - 23).toFixed(0) + 'px',
      }))
    );

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
      return run(950, easeInOut, (v) => {
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
            setBubbles([]);
          }, 1600)
        );
      });
    };

    run(1100, easeOut, (v) => {
      if (numRef.current) numRef.current.firstChild!.textContent = String(Math.round(v * 100));
    })
      .then(() => wait(180))
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
        <div className="wash__sheet" />
        <div className="wash__bubbles" ref={bubblesRef}>
          {bubbles.map((style, i) => (
            <i key={i} className="bub" style={style} />
          ))}
        </div>
        <div className="wash__edge" />
        <div className="wash__drips" ref={dripsRef} />
        <div className="wash__num" ref={numRef}>
          <span>0</span>
        </div>
      </div>
    </>
  );
}
