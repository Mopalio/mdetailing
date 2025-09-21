import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';

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
    <section id="pricing" className="py-20 bg-background text-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-300 hover:shadow-x hover:border-accent`
              }
            >
              
              
              <CardHeader className="text-center pb-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-accent">{tier.price}€</span>
                  <span className="text-slate-600 dark:text-slate-400">/wash</span>
                </div>
                <p className="">
                  {tier.description}
                </p>
              </CardHeader>
              
              
                
              
            </Card>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-8 max-w-6xl mx-auto">
            {/* Referral Card */}
            {/* <div className="bg-background-light rounded-lg p-8 border border-slate-600">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Refer a Friend
              </h3>
              <p className="text-slate-300 mb-6">
                Invite your friends to our car wash service and both of you will receive a <span className="font-bold text-accent">20% discount</span> on your next wash!
              </p>
              <div className="bg-accent/20 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-accent">20% OFF</div>
                <div className="text-sm text-slate-300">For both you and your friend</div>
              </div>
              <Button className="w-full" variant="secondary">
                Share with Friends
              </Button>
            </div> */}

            {/* Loyalty Card */}
            <div className="bg-background-light rounded-lg p-8 border border-slate-600">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Loyalty Rewards
              </h3>
              <p className="text-slate-300 mb-6">
                Get your <span className="font-bold text-accent">5th wash completely FREE</span> after 4 washes with our loyalty program!
              </p>
              <div className="bg-accent/20 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-accent">FREE WASH</div>
                <div className="text-sm text-slate-300">Every 5th wash is on us</div>
              </div>
              <div className="flex justify-center space-x-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 ${
                      i < 3 ? 'bg-accent border-accent' : 'border-slate-500'
                    }`}
                  >
                    {i < 3 && (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-400">
                Progress: 3/5 washes completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 