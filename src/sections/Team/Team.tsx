import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  description: string;
  experience: string;
  specialties: string[];
}

interface TeamProps {
  title: string;
  subtitle: string;
  members: TeamMember[];
}

export function Team({ title, subtitle, members }: TeamProps) {
  return (
    <section id="team" className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {members.map((member) => (
            <Card key={member.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Experience Badge */}
                <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                  {member.experience}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-accent font-medium mb-3">
                    {member.position}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {member.description}
                  </p>
                  
                  {/* Specialties */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Specialties:
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Team Stats */}
        <div className="mt-16 text-center">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              Why Our Team is the Best
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">15+</div>
                <div className="text-slate-600 dark:text-slate-400">Years Combined Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">100%</div>
                <div className="text-slate-600 dark:text-slate-400">Certified Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-2">24/7</div>
                <div className="text-slate-600 dark:text-slate-400">Customer Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">5000+</div>
                <div className="text-slate-600 dark:text-slate-400">Cars Washed</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-accent to-accent-dark rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience Our Professional Service?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Our experienced team is ready to give your car the care it deserves.
            </p>
            <a
              href="#appointment"
              className="inline-block bg-white text-accent px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors duration-200"
            >
              Book Your Appointment
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 