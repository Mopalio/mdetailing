'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { WashPanel, type WashPanelHandle } from '@/components/wash/WashPanel';

interface HeroProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
}

export function Hero({
  eyebrow = 'Luxembourg · Mobile detailing',
  title,
  titleAccent,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText = 'View pricing',
  secondaryCtaLink = '#pricing',
  imageUrl,
}: HeroProps) {
  const [percent, setPercent] = useState(0);
  const panelRef = useRef<WashPanelHandle>(null);
  const reduced = useReducedMotion();

  const onProgress = useCallback((p: number) => setPercent(p), []);

  /* the copy rises once, on load. framer-motion owns this so there
     is no hand-rolled rAF left in the section itself. */
  const rise = {
    hidden: { opacity: 0, y: reduced ? 0 : 18 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.7,
        delay: reduced ? 0 : 0.12 + i * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section className="hero--bleed">
      <div className="hero__media">
        <WashPanel
          ref={panelRef}
          imageUrl={imageUrl}
          alt="A car being pressure washed clean"
          onProgress={onProgress}
        />
      </div>

      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__over">
        <div className="hero__overIn">
          <motion.p
            className="flex items-center gap-2.5 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-fg-mid"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0}
          >
            <span className="inline-block h-1.5 w-1.5 bg-chrome-200" />
            {eyebrow}
          </motion.p>

          <motion.h1
            className="mt-5 mb-5 text-[clamp(2.4rem,6.4vw,5rem)] font-light leading-[0.98] tracking-[-0.03em] text-fg"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1}
          >
            {title}
            {titleAccent ? (
              <>
                {' '}
                <span className="text-metallic-silver inline-block font-normal">
                  {titleAccent}
                </span>
              </>
            ) : null}
          </motion.h1>

          <motion.p
            className="mb-8 max-w-[46ch] text-base leading-relaxed text-fg-mid lg:text-lg"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={2}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <a href={ctaLink} className="btn btn--solid btn--lg">
              <span className="btn__sq" />
              {ctaText}
            </a>
            <a href={secondaryCtaLink} className="btn btn--lg">
              {secondaryCtaText}
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__gauge"
          variants={rise}
          initial="hidden"
          animate="show"
          custom={4}
        >
          <div className="meter">
            <span style={{ width: percent + '%' }} />
          </div>
          <div className="meter__val">
            <b>{percent}</b>% clean
          </div>
          <button type="button" className="reset" onClick={() => panelRef.current?.reset()}>
            Dirty it again
          </button>
        </motion.div>
      </div>
    </section>
  );
}
