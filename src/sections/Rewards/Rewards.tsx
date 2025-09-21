import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface RewardTier {
  id: string;
  washes: number;
  reward: string;
  description: string;
  icon: string;
  color: string;
}

interface RewardsProps {
  title: string;
  subtitle: string;
  tiers: RewardTier[];
  currentWashes: number;
}

export function Rewards({ title, subtitle, tiers, currentWashes }: RewardsProps) {
  const getProgressPercentage = () => {
    const nextTier = tiers.find(tier => tier.washes > currentWashes) || tiers[tiers.length - 1];
    const previousTier = tiers.find(tier => tier.washes <= currentWashes) || { washes: 0 };
    const progress = ((currentWashes - previousTier.washes) / (nextTier.washes - previousTier.washes)) * 100;
    return Math.min(progress, 100);
  };

  const getNextReward = () => {
    return tiers.find(tier => tier.washes > currentWashes) || tiers[tiers.length - 1];
  };

  return (
    <section id="rewards" className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Current Progress */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-accent to-accent-dark text-white">
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold mb-2">Your Progress</h3>
              <p className="opacity-90">You&apos;ve completed {currentWashes} washes</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Progress to next reward</span>
                  <span className="text-sm font-semibold">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90">
                    Next reward: <span className="font-semibold">{getNextReward()?.reward}</span>
                  </p>
                  <p className="text-xs opacity-75">
                    {getNextReward()?.washes - currentWashes} more washes needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reward Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                currentWashes >= tier.washes 
                  ? 'border-success shadow-lg' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {currentWashes >= tier.washes && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-success text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${tier.color}`}>
                  <span className="text-2xl">{tier.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {tier.washes} Washes
                </h3>
                <p className="text-lg font-semibold text-accent">
                  {tier.reward}
                </p>
              </CardHeader>
              
              <CardContent className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {tier.description}
                </p>
                {currentWashes >= tier.washes ? (
                  <div className="bg-success/10 text-success px-4 py-2 rounded-lg text-sm font-medium">
                    ✓ Earned
                  </div>
                ) : (
                  <div className="text-slate-500 dark:text-slate-400 text-sm">
                    {tier.washes - currentWashes} washes to go
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              How Our Loyalty Program Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚗</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Get Your Car Washed</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Every wash counts towards your rewards
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Track Your Progress</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Monitor your washes and upcoming rewards
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Claim Your Rewards</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Enjoy free washes and exclusive benefits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-success to-success-dark rounded-xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Start Earning Rewards Today!
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join our loyalty program and get rewarded for choosing our professional car washing service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-success hover:bg-slate-100"
              >
                <a href="#appointment">
                  Book Your First Wash
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-success"
              >
                <a href="#pricing">
                  View Pricing
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 