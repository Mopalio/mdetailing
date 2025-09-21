'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AppointmentForm {
    name: string;
    email: string;
    phone: string;
    carSize: 'small' | 'medium' | 'large';
    date: string;
    time: string;
    message: string;
}

interface AppointmentProps {
    title: string;
    subtitle: string;
}

export function Appointment({ title, subtitle }: AppointmentProps) {
    const [formData, setFormData] = useState<AppointmentForm>({
        name: '',
        email: '',
        phone: '',
        carSize: 'medium',
        date: '',
        time: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (field: keyof AppointmentForm, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setIsSubmitted(true);
                // Reset form after 3 seconds
                setTimeout(() => {
                    setIsSubmitted(false);
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        carSize: 'medium',
                        date: '',
                        time: '',
                        message: '',
                    });
                }, 3000);
            } else {
                alert('Failed to book appointment. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <section
                id="appointment"
                className="py-20 bg-background"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-8 h-8 text-success"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Appointment Booked!</h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Thank you for choosing our service. We&apos;ll contact you shortly to confirm your appointment.<br />
                            Check your spam folder if you don&apos;t see it.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            id="appointment"
            className="py-20 bg-background-light"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
                    <p className="text-xl text-primary max-w-2xl mx-auto">{subtitle}</p>
                </div>

                <div className="max-w-2xl mx-auto bg-background rounded-lg">
                    <Card className="shadow-xl bg-background rounded-lg">
                        <CardHeader className="text-center">
                            <h3 className="text-2xl font-bold text-white">Book Your Car Wash</h3>
                            <p className="text-primary">
                                Fill out the form below and we&apos;ll get back to you within 24 hours
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Car Size</label>
                                        <select
                                            value={formData.carSize}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'carSize',
                                                    e.target.value as 'small' | 'medium' | 'large',
                                                )
                                            }
                                            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-background-light dark:text-white"
                                            required
                                        >
                                            <option value="small">Small Car (50€)</option>
                                            <option value="medium">Medium Car (65€)</option>
                                            <option value="large">Large Car (80€)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Preferred Date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                    />

                                    <Input
                                        label="Preferred Time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => handleInputChange('time', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => handleInputChange('message', e.target.value)}
                                        rows={4}
                                        className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-200 focus:border-dark-200 bg-background-light text-primary"
                                        placeholder="Any special requests or notes..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    variant="secondary"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <div className="mt-8 text-center">
                        <div className="bg-background rounded-lg p-6">
                            <h4 className="font-semibold text-primary mb-4">Need Immediate Assistance?</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-accent mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    <span className="text-slate-600 dark:text-slate-400 hover:text-white transition-all duration-500">
                                        Instagram:{' '}
                                        <a
                                            href="https://www.instagram.com/m_detailing2025/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            m_detailing2025
                                        </a>
                                    </span>
                                </div>
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-accent mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span className="text-slate-600 dark:text-slate-400 hover:text-white transition-all duration-500">
                                        Email:{' '}
                                        <a
                                            href="mailto:mdetailing2025@gmail.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            mdetailing2025@gmail.com
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
