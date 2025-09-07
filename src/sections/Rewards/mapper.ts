import React from 'react';
import { Rewards } from './Rewards';

export interface RewardTier {
  id: string;
  washes: number;
  reward: string;
  description: string;
  icon: string;
  color: string;
}

export interface RewardsData {
  title: string;
  subtitle: string;
  tiers: RewardTier[];
  currentWashes: number;
}

export function RewardsMapper(data: RewardsData) {
  return React.createElement(Rewards, data);
} 