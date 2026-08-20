import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/layout/theme-provider";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = { title: "TaskFlow — Task Management", description: "Beautiful, fast task management with themes, guest login, and real-time updates." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex flex-col">
        <ThemeProvider>
          <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=t==='system'?s:t;document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(r);document.documentElement.setAttribute('data-theme',r);document.documentElement.style.colorScheme=r;}catch(e){}})();` }} />
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            <div className="mx-auto max-w-6xl px-4">Built with Next.js + NestJS • TaskFlow © {new Date().getFullYear()}</div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
