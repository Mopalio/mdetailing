'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/* Where the cards stop fitting side by side, measured rather than
   chosen: a pricing card's longest feature line wraps below 254px,
   so 280px is the floor with slack. Three of those plus two 2rem
   gaps and two 2rem gutters is 976px of viewport.

   Kept in sync with the @media rule in src/app/wash.css. */
export const SWIPE_BREAKPOINT = 976;

interface CardSwiperProps {
  children: React.ReactNode;
  /** announced to screen readers, e.g. "Pricing packages" */
  label: string;
  className?: string;
}

/**
 * A row that is a grid while everything fits and a swipeable strip
 * once it does not.
 *
 * Touch and trackpad use native scroll-snap, so momentum and rubber
 * banding are the platform's own. A mouse gets pointer drag layered
 * on top, with snapping switched off mid-drag so the row tracks the
 * cursor exactly. A drag never turns into a click on a card.
 */
export function CardSwiper({ children, label, className }: CardSwiperProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startLeft = useRef(0);
  const moved = useRef(0);

  const [swipeable, setSwipeable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* only a strip below the breakpoint; above it CSS makes it a grid
     and the drag handlers have to stay out of the way */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: ' + (SWIPE_BREAKPOINT - 0.02) + 'px)');
    const sync = () => setSwipeable(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const railState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 4;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max);
  }, []);

  useEffect(() => {
    railState();
  }, [railState, swipeable, children]);

  /* ── pointer drag, mouse only ───────────────────────────── */

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragging.current = true;
      moved.current = 0;
      startX.current = e.clientX;
      startLeft.current = el.scrollLeft;
      if (swipeable) el.classList.add('is-drag');
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const d = e.clientX - startX.current;
      moved.current = Math.max(moved.current, Math.abs(d));
      if (swipeable) el.scrollLeft = startLeft.current - d;
    };

    const endDrag = () => {
      if (!dragging.current) return;
      dragging.current = false;
      el.classList.remove('is-drag');
      /* let the click that follows this pointerup be suppressed
         first, then forget the distance */
      setTimeout(() => {
        moved.current = 0;
      }, 0);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointerleave', endDrag);
    el.addEventListener('pointercancel', endDrag);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointerleave', endDrag);
      el.removeEventListener('pointercancel', endDrag);
    };
  }, [swipeable]);

  /* a drag that ends on a link or button must not activate it */
  const swallowClick = useCallback((e: React.MouseEvent) => {
    if (moved.current > 6) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = 0;
    }
  }, []);

  const page = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current;
      const first = trackRef.current?.firstElementChild as HTMLElement | null;
      if (!el || !first) return;
      const gap = parseFloat(getComputedStyle(trackRef.current!).columnGap) || 24;
      el.scrollBy({
        left: dir * (first.getBoundingClientRect().width + gap),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    },
    []
  );

  return (
    <div className={className}>
      <div
        className="swipe"
        ref={scrollerRef}
        onScroll={railState}
        onClickCapture={swallowClick}
        role={swipeable ? 'region' : undefined}
        aria-label={swipeable ? label : undefined}
        tabIndex={swipeable ? 0 : undefined}
      >
        <div className="swipe__track" ref={trackRef}>
          {children}
        </div>
      </div>

      {swipeable ? (
        <div className="swipe-rail mt-2">
          <button
            type="button"
            className="swipe-rail__b"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label={'Previous, ' + label.toLowerCase()}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            className="swipe-rail__b"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label={'Next, ' + label.toLowerCase()}
          >
            <Arrow dir="right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={dir === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
