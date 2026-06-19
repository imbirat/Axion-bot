import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Axion Bot Dashboard',
  description: 'Manage your Axion Discord bot settings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--text)]">
        <SessionProvider>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
