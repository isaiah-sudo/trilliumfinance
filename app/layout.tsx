import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Trillium Finance',
  description: 'Modern finance dashboard with realtime insights',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased">
        <SettingsProvider>
          <AuthProvider>{children}</AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

