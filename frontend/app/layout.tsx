import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cache Ledger | Predictive Cloud-Cost Caching Engine',
  description:
    'Intelligent caching middleware that optimizes TTLs based on traffic patterns, reduces database requests, and calculates real-time cloud cost savings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Oxanium:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors">
        {children}
      </body>
    </html>
  );
}
