'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardSwiper } from '@/components/ui/CardSwiper';
import { TiltCard } from '@/components/ui/TiltCard';
import { BeforeAfter } from '@/components/gallery/BeforeAfter';
import { carSVG, FLEET } from '@/components/gallery/cars';

interface GalleryProps {
  title: string;
  subtitle: string;
  instagramUrl?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Gallery: before and after.

   The cars are the drawn placeholders from the prototype, not
   photos: every pair is the same geometry twice, once grimy and
   once clean. When real photos exist, carSVG() becomes an <img>
   and nothing else in here changes.
   ═══════════════════════════════════════════════════════════ */

export function Gallery({ title, subtitle, instagramUrl = 'https://www.instagram.com/m_detailing2025' }: GalleryProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="gallery" className="bg-ink py-20 text-fg">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2.5 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-fg-mid">
              <span className="inline-block h-1.5 w-1.5 bg-chrome-200" />
              The work
            </p>
            <h2 className="mb-4 text-[clamp(2rem,4.6vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">
              {title}
            </h2>
            <p className="text-base leading-relaxed text-fg-mid lg:text-lg">{subtitle}</p>
          </div>
          <p className="max-w-[26ch] text-sm leading-relaxed text-fg-dim">
            Drag the strip. Tap a car to pull the slider across it.
          </p>
        </div>

        <CardSwiper label="Before and after examples">
          {FLEET.map((car, i) => (
            <motion.div
              key={car.id}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard
                as="article"
                className="group h-full overflow-hidden rounded-[4px] border border-line bg-gradient-to-b from-ink-2 to-ink-1"
              >
                <button
                  type="button"
                  className="block w-full cursor-pointer text-left"
                  onClick={() => setOpen(i)}
                  aria-label={car.title + ', before and after'}
                >
                  <span className="card__stage">
                    <span
                      className="card__svg"
                      dangerouslySetInnerHTML={{
                        __html: carSVG({ type: car.type, paint: car.paint, seed: car.seed, dirty: true }),
                      }}
                    />
                    <span
                      className="card__after"
                      dangerouslySetInnerHTML={{
                        __html: carSVG({ type: car.type, paint: car.paint, seed: car.seed, dirty: false }),
                      }}
                    />
                    <span className="card__swipe" />
                  </span>

                  <span className="flex items-center justify-between gap-4 border-t border-line px-5 py-4">
                    <span className="min-w-0">
                      <span className="block text-base font-medium tracking-tight text-fg">
                        {car.title}
                      </span>
                      <span className="mt-0.5 block text-[0.62rem] uppercase tracking-[0.16em] text-fg-dim">
                        {car.sub}
                      </span>
                    </span>
                    <span className="card__go">↗</span>
                  </span>
                </button>
              </TiltCard>
            </motion.div>
          ))}
        </CardSwiper>

        <p className="mt-8 text-sm text-fg-dim">
          Placeholder renders. Swap each pair for a real photo and nothing else changes.{' '}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-chrome-200"
          >
            More on Instagram
          </a>
        </p>
      </div>

      {open !== null ? (
        <BeforeAfter
          fleet={FLEET}
          index={open}
          onClose={() => setOpen(null)}
          onIndex={(i) => setOpen(i)}
        />
      ) : null}
    </section>
  );
}
