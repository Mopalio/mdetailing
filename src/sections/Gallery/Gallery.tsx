import React from 'react';
import Image from 'next/image';

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
}

interface GalleryProps {
    title: string;
    subtitle: string;
    images: GalleryImage[];
}

export function Gallery({ title, subtitle, images }: GalleryProps) {
    return (
        <section className="py-20 border-b border-t border-gray-700">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
                    {/* <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p> */}
                </div>

                <div className=" gap-8">
                    {/* {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                <p className="text-sm opacity-90">{image.description}</p>
              </div>
              
              <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))} */}
                    <div className="text-center mx-auto text-xl font-bold text-white">
                        <p>This section is under construction! </p>
                        <p>Please checkout instagram for more images here:{' '}</p>
                        <div className="text-accent hover:text-accent-dark transition-all duration-500 text-3xl mt-8">
                            <a
                                href="https://www.instagram.com/m_detailing2025/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer border border-blue-500 rounded-md p-4"
                            >
                                m_detailing2025
                            </a>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                {/* <div className="mt-16 text-center">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                            Our Results Speak for Themselves
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent mb-2">1000+</div>
                                <div className="text-slate-600 dark:text-slate-400">Cars Washed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-success mb-2">98%</div>
                                <div className="text-slate-600 dark:text-slate-400">Satisfaction Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-warning mb-2">15min</div>
                                <div className="text-slate-600 dark:text-slate-400">Average Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                                <div className="text-slate-600 dark:text-slate-400">Service Available</div>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </section>
    );
}
