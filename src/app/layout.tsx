
import type { Metadata } from 'next';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/layout/app-header';
import React from 'react';
import { AppStateProvider } from '@/components/app-state';

export const metadata: Metadata = {
  title: 'Imperium',
  description: 'The future of gold-backed DeFi.',
  icons: {
    icon: [
      { url: '/logo.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/logo.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/logo_large.svg', sizes: '48x48', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo_large.svg', sizes: '180x180', type: 'image/svg+xml' },
    ]
  },
};

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(playfairDisplay.variable, ptSans.variable)}>
      <body>
        <AppStateProvider>
            <div className="flex min-h-screen flex-col">
              <AppHeader />
              <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
                 {children}
              </div>
            </div>
          <Toaster />
        </AppStateProvider>
      </body>
    </html>
  );
}
