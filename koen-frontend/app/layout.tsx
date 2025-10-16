import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Outfit } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ConnectProvider } from '@/lib/providers/connect-provider';
import { Toaster } from 'react-hot-toast';

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
        <ConnectProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1E2329',
                  color: '#fff',
                  border: '1px solid #2B3139',
                },
                success: {
                  iconTheme: {
                    primary: '#0ECB81',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#F6465D',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </QueryProvider>
        </ConnectProvider>
      </body>
    </html>
  );
}
