'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   TiltCard: a card that leans towards the pointer.

   Ported from the `data-tilt` behaviour in design/js/ui.js: the
   pointer's position inside the card drives rotateX and rotateY,
   and the card lifts slightly while it is under the cursor. A
   specular highlight follows the pointer so the lean reads as a
   surface catching light rather than a flat rectangle rotating.

   The transform lives on this element alone. Anything animating the
   card's entrance (framer-motion, say) must sit on a parent, because
   two owners writing the same inline transform is what silently
   cancelled the old CSS hover.

   Only for a real mouse: a touch screen has no hover to speak of,
   and a reduced-motion reader has asked not to be moved.
   ═══════════════════════════════════════════════════════════ */

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** degrees of lean at the edges */
  max?: number;
  /** how far the card lifts while hovered, in px */
  lift?: number;
  as?: 'div' | 'article';
}

export function TiltCard({
  children,
  className,
  max = 6,
  lift = 6,
  as: Tag = 'div',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEnabled(mq.matches && !reduced.matches);
    sync();
    mq.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!enabled || !el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      cancelAnimationFrame(raf.current);
      /* tracked with no transform transition, so the card follows the
         pointer exactly; the class is dropped on the way out so the
         return to rest eases instead of snapping */
      el.classList.add('is-tilting');
      raf.current = requestAnimationFrame(() => {
        el.style.transform =
          'perspective(900px) rotateX(' + (-py * max).toFixed(2) +
          'deg) rotateY(' + (px * max).toFixed(2) +
          'deg) translateY(' + -lift + 'px)';
        /* where the highlight sits, as a percentage of the card */
        el.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
      });
    },
    [enabled, max, lift]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.classList.remove('is-tilting');
    el.style.transform = '';
    el.style.removeProperty('--gx');
    el.style.removeProperty('--gy');
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
      className={['tilt', className].filter(Boolean).join(' ')}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      <span className="tilt__sheen" aria-hidden="true" />
    </Tag>
  );
}
