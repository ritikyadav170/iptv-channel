import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dekho TV - Free Live Cable Television Streaming',
  description:
    'Dekho TV - Free live TV streaming platform featuring continuous 24/7 live cable television coverage across News, Kids, and Entertainment in Hindi, English, Bengali, Kannada, Telugu, Marathi, Urdu, and Malayalam.',
  keywords: [
    'Dekho TV',
    'Live TV',
    'Cable TV',
    'Zero Learning Curve TV',
    'Indian News',
    'Kids Cartoons Live',
    'NDTV India Live',
    'ABP News Live',
    'Sony YAY Live',
    'Pogo Live',
    'HLS Stream',
    'Free Live TV',
    'IPTV India',
  ],
  authors: [{ name: 'Dekho TV Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#06080d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-[#06080d] text-foreground antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
