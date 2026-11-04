'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CardSwiper } from '@/components/ui/CardSwiper';
import { TiltCard } from '@/components/ui/TiltCard';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PricingProps {
  title: string;
  subtitle: string;
  tiers: PricingTier[];
}

export function Pricing({ title, subtitle, tiers }: PricingProps) {
  return (
    <section id="pricing" className="bg-ink py-20 text-fg">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 flex items-center gap-2.5 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-fg-mid">
            <span className="inline-block h-1.5 w-1.5 bg-chrome-200" />
            Packages
          </p>
          <h2 className="mb-4 text-[clamp(2rem,4.6vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">
            {title}
          </h2>
          <p className="text-base leading-relaxed text-fg-mid lg:text-lg">{subtitle}</p>
        </div>

        <CardSwiper label="Pricing packages">
          {tiers.map((tier, i) => (
            /* the entrance transform lives out here and the tilt lives on
               the TiltCard, so the two never write the same inline style */
            <motion.div
              key={tier.id}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
            <TiltCard
              as="article"
              className={[
                'group relative flex h-full flex-col rounded-[4px] border bg-gradient-to-b from-ink-2 to-ink-1 p-7',
                tier.popular
                  ? 'border-chrome-400/60 shadow-[0_36px_80px_-40px_rgba(233,238,240,0.35)]'
                  : 'border-line',
              ].join(' ')}
            >
              {tier.popular ? (
                <span className="absolute right-6 top-0 -translate-y-1/2 rounded-[2px] bg-accent px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-on-accent">
                  Most booked
                </span>
              ) : null}

              <h3 className="text-xl font-medium tracking-tight text-fg">{tier.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-dim">{tier.description}</p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-light tracking-[-0.04em] text-chrome-50">
                  {tier.price}
                </span>
                <span className="text-2xl font-light text-chrome-400">€</span>
                <span className="ml-1 text-sm text-fg-dim">/ wash</span>
              </p>

              <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-line pt-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-fg-mid">
                    <Check />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#appointment"
                className={[
                  'btn btn--block mt-8',
                  tier.popular ? 'btn--solid' : '',
                ].join(' ')}
              >
                Book {tier.name.toLowerCase()}
              </a>
            </TiltCard>
            </motion.div>
          ))}
        </CardSwiper>

        {/* Loyalty */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-md rounded-[4px] border border-line bg-ink-1 p-8 text-center">
            <h3 className="mb-3 text-xl font-medium text-fg">Loyalty rewards</h3>
            <p className="mb-6 text-sm leading-relaxed text-fg-mid">
              Your <span className="font-semibold text-chrome-50">5th wash is free</span> after
              four washes with the loyalty programme.
            </p>
            <div className="mb-4 flex justify-center gap-2.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={[
                    'grid h-7 w-7 place-items-center rounded-full border text-[0.7rem] font-bold',
                    i < 3
                      ? 'border-chrome-200 bg-chrome-200 text-on-accent'
                      : 'border-chrome-700 text-transparent',
                  ].join(' ')}
                >
                  {i < 3 ? '✓' : ''}
                </div>
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-fg-dim">3 of 5 washes done</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 flex-none text-chrome-300"
      aria-hidden="true"
    >
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  );
}
