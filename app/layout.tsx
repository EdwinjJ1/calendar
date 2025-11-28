import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { QueryProvider } from '@/components/providers/QueryProvider';
import AppShell from '@/components/layout/AppShell';
import "./globals.css";

export const metadata: Metadata = {
  title: "TODU - Daily Habits & Tasks",
  description: "Minimalist habit tracker and daily task manager.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            <AppShell>
              {children}
            </AppShell>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
