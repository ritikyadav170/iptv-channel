import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || 'StreamPulse Live TV - 24/7 Live Indian News Streaming',
  description:
    'Free live TV streaming platform featuring continuous 24/7 Indian news coverage across Hindi, English, Bengali, Kannada, Telugu, Marathi, Urdu, and Malayalam.',
  keywords: [
    'Live TV',
    'Indian News',
    'NDTV India Live',
    'ABP News Live',
    'News18 India Live',
    'HLS Stream',
    'Free Live TV',
    'IPTV India',
  ],
  authors: [{ name: 'StreamPulse Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080b11',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
