'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { carSVG, rng, type FleetCar } from './cars';

/* ═══════════════════════════════════════════════════════════════
   BeforeAfter: the modal that pulls a slider across one car.

   Ported from the modal half of design/js/gallery.js. Opening runs
   a short demo sweep so it is obvious the divider is draggable,
   and the handle is a real slider for the keyboard.
   ═══════════════════════════════════════════════════════════ */

interface BeforeAfterProps {
  fleet: FleetCar[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}

export function BeforeAfter({ fleet, index, onClose, onIndex }: BeforeAfterProps) {
  const baRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef(0);
  const sliding = useRef(false);
  const [split, setSplit] = useState(50);

  const car = fleet[index];

  const clampSet = useCallback((v: number) => {
    setSplit(Math.max(0, Math.min(100, v)));
  }, []);

  /* sweep in from the right so the divider announces itself */
  useEffect(() => {
    cancelAnimationFrame(demoRef.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSplit(50);
      return;
    }
    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / 1150);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setSplit(94 - e * 44);
      if (p < 1) demoRef.current = requestAnimationFrame(frame);
    };
    demoRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(demoRef.current);
  }, [index]);

  /* lock the page behind the modal and wire the keyboard */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        onIndex((index + 1) % fleet.length);
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        onIndex((index - 1 + fleet.length) % fleet.length);
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => handleRef.current?.focus(), 320);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [index, fleet.length, onClose, onIndex]);

  const fromEvent = useCallback(
    (e: React.PointerEvent) => {
      const el = baRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      clampSet(((e.clientX - r.left) / r.width) * 100);
    },
    [clampSet]
  );

  const sparks = React.useMemo(() => {
    const r = rng(car.seed + 17);
    return Array.from({ length: 9 }, () => ({
      left: (52 + r() * 44).toFixed(1) + '%',
      top: (14 + r() * 66).toFixed(1) + '%',
      ['--s' as string]: (7 + r() * 11).toFixed(0) + 'px',
      ['--delay' as string]: (r() * 2.4).toFixed(2) + 's',
    })) as React.CSSProperties[];
  }, [car.seed]);

  return (
    <div className="modal is-open" role="dialog" aria-modal="true" aria-label="Before and after">
      <div className="modal__scrim" onClick={onClose} />
      <div className="modal__box">
        <button className="modal__x" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <div
          className="ba"
          ref={baRef}
          style={{ ['--split' as string]: split + '%' }}
          onPointerDown={(e) => {
            sliding.current = true;
            cancelAnimationFrame(demoRef.current);
            try {
              baRef.current?.setPointerCapture(e.pointerId);
            } catch {
              /* capture is a nicety, not a requirement */
            }
            fromEvent(e);
          }}
          onPointerMove={(e) => {
            if (sliding.current) fromEvent(e);
          }}
          onPointerUp={() => {
            sliding.current = false;
          }}
          onPointerCancel={() => {
            sliding.current = false;
          }}
        >
          <div
            className="ba__layer ba__before"
            dangerouslySetInnerHTML={{
              __html: carSVG({ type: car.type, paint: car.paint, seed: car.seed, dirty: true }),
            }}
          />
          <div
            className="ba__layer ba__after"
            dangerouslySetInnerHTML={{
              __html: carSVG({ type: car.type, paint: car.paint, seed: car.seed, dirty: false }),
            }}
          />
          <span className="ba__tag ba__tag--b">Before</span>
          <span className="ba__tag ba__tag--a">After</span>

          <div
            className="ba__handle"
            ref={handleRef}
            tabIndex={0}
            role="slider"
            aria-label="Reveal the clean side"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(split)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 10 : 2;
              if (e.key === 'ArrowLeft') {
                cancelAnimationFrame(demoRef.current);
                clampSet(split - step);
                e.preventDefault();
              }
              if (e.key === 'ArrowRight') {
                cancelAnimationFrame(demoRef.current);
                clampSet(split + step);
                e.preventDefault();
              }
              if (e.key === 'Home') {
                clampSet(0);
                e.preventDefault();
              }
              if (e.key === 'End') {
                clampSet(100);
                e.preventDefault();
              }
            }}
          >
            <span className="ba__grip">↔</span>
          </div>

          <div className="ba__sparks" aria-hidden="true">
            {sparks.map((style, i) => (
              <i key={i} className="spark" style={style} />
            ))}
          </div>
        </div>

        <div className="modal__meta">
          <div>
            <h3>{car.title}</h3>
            <p>{car.sub}</p>
          </div>
          <div className="modal__nav">
            <button
              type="button"
              aria-label="Previous car"
              onClick={() => onIndex((index - 1 + fleet.length) % fleet.length)}
            >
              ←
            </button>
            <span>
              {index + 1} / {fleet.length}
            </span>
            <button
              type="button"
              aria-label="Next car"
              onClick={() => onIndex((index + 1) % fleet.length)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
