import React from 'react';
import { Pricing } from './Pricing';

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface PricingData {
  title: string;
  subtitle: string;
  tiers: PricingTier[];
}

export function PricingMapper(data: PricingData) {
  return React.createElement(Pricing, data);
} 