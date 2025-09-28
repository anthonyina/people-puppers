import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🐶 People Puppers - Find Your Dog Breed Twin!",
  description: "Take a selfie and discover which dog breed you look like! AI-powered facial analysis matches your features to over 200 dog breeds.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "🐶 People Puppers - Find Your Dog Breed Twin!",
    description: "Take a selfie and discover which dog breed you look like! AI-powered facial analysis matches your features to over 200 dog breeds.",
    url: "https://www.people-puppers.app",
    siteName: "People Puppers",
    images: [
      {
        url: "/charlotte_and_willie.png",
        width: 1200,
        height: 630,
        alt: "People Puppers - Find Your Dog Breed Twin",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🐶 People Puppers - Find Your Dog Breed Twin!",
    description: "Take a selfie and discover which dog breed you look like! AI-powered facial analysis matches your features to over 200 dog breeds.",
    images: ["/charlotte_and_willie.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js"
          strategy="beforeInteractive"
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
