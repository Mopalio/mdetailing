'use client';

import React, { useEffect, useRef } from 'react';
import { registerWash, washTo } from './washController';
import { WASH_SESSION_KEY } from './session';

/* ═══════════════════════════════════════════════════════════════
   WashTransition: the wash, ported from design/js/transition.js.

   One overlay does both jobs the prototype gave it.

     intro   the loader. A foam sheet is already down on first
             paint, with suds drifting through it, water streaking
             down it and bubbles rising. It counts up, then a
             squeegee pulls the sheet off and the page is there.

     go(fn)  a move between sections. The sheet drops to cover the
             screen, fn() runs behind it (the scroll happens where
             nobody can see it), then the squeegee pulls it off.

   Two deliberate changes from the prototype:

   - The intro plays once per browser session. The prototype
     replayed it on every move between artboards, which was the
     point there; on a real site a full curtain on every visit is a
     tax on the person reading it. go() is not rationed: it is the
     response to something the reader just clicked.
   - The curtain is rendered by the server already covering the
     screen, so there is no frame of bare content before it lands.
     <noscript> removes it entirely, otherwise a reader without
     JavaScript would be stuck behind it.

   Hand-rolled rather than framer-motion on purpose: it drives
   clip-path percentages and spawns drips off the blade edge, which
   needs the frame callback.
   ═══════════════════════════════════════════════════════════ */

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;

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

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let cancelled = false;
    let busy = false;
    /* Bumped whenever a wash is abandoned. An in-flight animation
       checks it every frame, so a curtain that was force-cleared can
       never be painted back over the page by frames still queued. */
    let gen = 0;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
      return t;
    };

    const run = (ms: number, ease: (t: number) => number, onFrame: (v: number) => void) =>
      new Promise<void>((resolve) => {
        if (reduced) {
          onFrame(1);
          resolve();
          return;
        }
        const t0 = performance.now();
        const myGen = gen;
        const frame = (now: number) => {
          if (cancelled || myGen !== gen) return resolve();
          const p = Math.min(1, (now - t0) / ms);
          onFrame(ease(p));
          if (p < 1) raf = requestAnimationFrame(frame);
          else resolve();
        };
        raf = requestAnimationFrame(frame);
      });

    const wait = (ms: number) =>
      new Promise<void>((r) => {
        if (reduced) return r();
        later(r, ms);
      });

    /* Put the page back no matter what. requestAnimationFrame stops
       entirely in a background tab, so someone who clicks a menu item
       and immediately switches tab would otherwise come back to a
       screen still covered in foam. setTimeout keeps running there
       (throttled, but it runs), so it is what rescues the page. */
    const clearCurtain = () => {
      gen++;
      el.classList.remove('is-on', 'is-wiping', 'is-intro');
      el.style.setProperty('--cover', '0%');
      el.style.setProperty('--y', '0%');
      root.classList.remove('is-washing', 'is-booting');
      busy = false;
    };

    const arm = (ms: number) => {
      clearTimeout(watchdog);
      watchdog = setTimeout(clearCurtain, ms);
    };

    const disarm = () => clearTimeout(watchdog);

    /* a drop of water left hanging off the blade */
    const dripAt = (yPct: number) => {
      const drips = dripsRef.current;
      if (!drips || reduced) return;
      const d = document.createElement('i');
      d.className = 'drip';
      d.style.left = (Math.random() * 100).toFixed(1) + '%';
      d.style.top = yPct.toFixed(2) + '%';
      d.style.setProperty('--w', (2 + Math.random() * 4).toFixed(1) + 'px');
      d.style.setProperty('--h', (50 + Math.random() * 170).toFixed(0) + 'px');
      d.style.setProperty('--d', (0.7 + Math.random() * 0.8).toFixed(2) + 's');
      drips.appendChild(d);
      later(() => d.remove(), 1800);
    };

    /* the foam sheet drops in from the top */
    const cover = () => {
      el.classList.add('is-on', 'is-wiping');
      el.style.setProperty('--y', '0%');
      return run(620, easeIn, (v) => {
        const p = v * 100;
        el.style.setProperty('--cover', p + '%');
        el.style.setProperty('--edge', p + '%');
      }).then(() => {
        el.classList.remove('is-wiping');
      });
    };

    /* the squeegee pulls the sheet down and off */
    const wipe = () => {
      el.classList.add('is-on', 'is-wiping');
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
        later(() => {
          if (dripsRef.current) dripsRef.current.innerHTML = '';
        }, 1600);
      });
    };

    /* ── a move between sections ───────────────────────────── */

    const go = (swap: () => void) => {
      /* reduced motion, or a wash already running: still go there,
         just without the curtain. Never swallow the navigation. */
      if (busy || reduced) {
        swap();
        return Promise.resolve();
      }
      busy = true;
      root.classList.add('is-washing');
      const myGen = gen;
      const alive = () => myGen === gen;
      arm(6000);

      return cover()
        .then(() => {
          /* the swap runs even if the curtain was abandoned: going
             where the reader asked matters more than the animation */
          try {
            swap();
          } catch {
            /* a failed swap must not strand the curtain */
          }
          if (!alive()) return;
          return wait(230).then(wipe);
        })
        .then(() => {
          disarm();
          if (!alive()) return;
          root.classList.remove('is-washing');
          busy = false;
        });
    };

    registerWash(go);

    /* ── the loader ────────────────────────────────────────── */

    let seen = false;
    try {
      seen = sessionStorage.getItem(WASH_SESSION_KEY) === '1';
    } catch {
      /* private mode can throw on access; treat it as a first visit */
    }

    if (seen || reduced) {
      el.classList.remove('is-on', 'is-intro', 'is-wiping');
      el.style.setProperty('--cover', '0%');
      el.style.setProperty('--y', '0%');
      root.classList.remove('is-washing', 'is-booting');
    } else {
      try {
        sessionStorage.setItem(WASH_SESSION_KEY, '1');
      } catch {
        /* nothing to do: it just plays again next time */
      }

      busy = true;
      root.classList.add('is-washing', 'is-booting');
      el.classList.add('is-on', 'is-intro');
      arm(8000);

      run(1250, easeOut, (v) => {
        if (numRef.current) numRef.current.textContent = String(Math.round(v * 100));
      })
        .then(() => wait(200))
        .then(wipe)
        .then(() => {
          disarm();
          root.classList.remove('is-washing', 'is-booting');
          busy = false;
        });
    }

    return () => {
      cancelled = true;
      registerWash(null);
      clearTimeout(watchdog);
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers.clear();
      root.classList.remove('is-washing', 'is-booting');
    };
  }, []);

  /* Every in-page link goes through the wash too, so the menu and a
     button like "View pricing" behave the same way. Anything that
     leaves the page, opens a tab, or is a modified click is left
     alone, and so is a link whose target is not on this page. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element | null)?.closest?.('a');
      if (!a) return;

      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#') || href === '#') return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      washTo(() => {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
        history.replaceState(null, '', href);
      });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
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
