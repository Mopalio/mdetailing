import React from 'react';
import { Hero } from './Hero';

export interface HeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export function HeroMapper(data: HeroData) {
  return React.createElement(Hero, data);
} 