'use client';
import React from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Beams from '@/components/ui/Beams';
import CountUp from '@/components/ui/CountUp';

interface HeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
}

export function Hero({ title, subtitle, ctaText, ctaLink, imageUrl }: HeroProps) {
    return (
        <section className="relative lg:py-20 py-10 flex items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0">
                <Beams
                    beamWidth={2}
                    beamHeight={15}
                    beamNumber={12}
                    lightColor="#ffffff"
                    speed={2}
                    noiseIntensity={1.75}
                    scale={0.2}
                    rotation={0}
                />
            </div>
            <div className="container mx-auto px-4 lg:py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-0 items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-metallic-silver mb-6">
                            {title}
                            <span
                                className="layer1"
                                aria-hidden="true"
                            >
                                {title}
                            </span>
                        </h1>
                        <p className="lg:text-xl text-base text-slate-200 mb-8 max-w-2xl mx-auto lg:mx-0">{subtitle}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                variant="secondary"
                            >
                                <a href={ctaLink}>{ctaText}</a>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                            >
                                <a href="#pricing">View Pricing</a>
                            </Button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={imageUrl}
                                alt="Professional car washing service"
                                width={600}
                                height={400}
                                className="w-full h-auto object-cover main-hero-image"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>

                        {/* Floating Stats */}
                        <div className="absolute max-w-[150px] lg:-bottom-6 lg:-left-6 bottom-0 right-0 bg-metallic-silver-background rounded-lg shadow-xl p-4 border border-slate-400">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    +
                                    <CountUp
                                        from={0}
                                        to={87}
                                        separator=","
                                        direction="up"
                                        duration={1}
                                        className="count-up-text"
                                    />
                                </div>
                                <div className="text-sm text-slate-200">Happy Customers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
