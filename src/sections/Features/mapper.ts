import React from 'react';
import { Features } from './Features';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FeaturesData {
  title: string;
  subtitle: string;
  features: Feature[];
}

export function FeaturesMapper(data: FeaturesData) {
  return React.createElement(Features, data);
} 