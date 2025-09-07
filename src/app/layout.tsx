import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Professional Car Washing Service",
  description: "Experience the finest car washing service with state-of-the-art equipment and eco-friendly products. Book your appointment today!",
  keywords: ["car wash", "auto detailing", "car cleaning", "professional car wash", "vehicle cleaning"],
  authors: [{ name: "Car Wash Pro" }],
  openGraph: {
    title: "Professional Car Washing Service",
    description: "Experience the finest car washing service with state-of-the-art equipment and eco-friendly products",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com",
    siteName: "Professional Car Washing Service",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Professional Car Washing Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Car Washing Service",
    description: "Experience the finest car washing service with state-of-the-art equipment and eco-friendly products",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
