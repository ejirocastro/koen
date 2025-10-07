import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700']
});
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'Kōen Protocol - Reputation-Based Lending',
  description: 'Your Bitcoin activity is your credit score',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${spaceGrotesk.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
