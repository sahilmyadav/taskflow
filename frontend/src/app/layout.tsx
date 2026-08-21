import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { InlineScript } from '@/components/layout/inline-script';
import { THEME_INIT_SCRIPT } from '@/lib/theme-script';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow — Task Management',
  description: 'Beautiful, fast task management with themes, guest login, and real-time updates.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies the saved theme while the browser parses the document, before
            the first paint. It must sit in <head> and outside any Client
            Component — React never executes <script> tags it renders on the
            client. next/script's beforeInteractive is not a substitute: it is
            meant for external scripts and explicitly does not block paint. */}
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#f6f6f5] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
