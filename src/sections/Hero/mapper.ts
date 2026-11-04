import React from 'react';
import { Hero } from './Hero';

export interface HeroData {
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

export function HeroMapper(data: HeroData) {
  return React.createElement(Hero, data);
}
