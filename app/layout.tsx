import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import { PropsWithChildren } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Trillium Finance',
  description: 'Modern finance dashboard with realtime insights',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen w-full bg-[#050505] text-slate-100 font-sans antialiased flex flex-col">
        <AuthProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

