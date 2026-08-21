import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow — Task Management",
  description: "Beautiful, fast task management with themes, guest login, and real-time updates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f6f6f5] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider>
          {/* prevent FOUC */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=t==='system'?s:t;document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(r);document.documentElement.setAttribute('data-theme',r);document.documentElement.style.colorScheme=r;}catch(e){}})();`,
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
