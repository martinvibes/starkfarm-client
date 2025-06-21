import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import React from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Troves | Yield aggregator on Starknet',
  description:
    'Find and invest in high yield pools. Troves is the best yield aggregator on Starknet.',
  openGraph: {
    title: 'Troves | Yield aggregator on Starknet',
    description:
      'Find and invest in high yield pools. Troves is the best yield aggregator on Starknet.',
    images: ['https://static-assets-8zct.onrender.com/strkfarm/og-img-png.png'],
  },
  twitter: {
    creator: '@akiraonstarknet',
    title: 'Troves | Yield aggregator on Starknet',
    description:
      'Find and invest in high yield pools. Troves is the best yield aggregator on Starknet.',
    card: 'player',
    images: ['https://static-assets-8zct.onrender.com/strkfarm/og-img-png.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="black" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body style={{ background: 'black' }}>
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-K05JV94KM9" />
    </html>
  );
}
