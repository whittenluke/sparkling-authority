import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Plus_Jakarta_Sans } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ["latin"] });
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta'
})

export const metadata: Metadata = {
  title: "SparklingAuthority - Your Guide to Sparkling Water",
  description: "The leading online authority for sparkling water enthusiasts, offering expert content, user-generated reviews, and structured comparisons.",
  keywords: "sparkling water, carbonated water, water reviews, beverage reviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${plusJakartaSans.variable} app-background`}>
        <ThemeProvider defaultTheme="system" storageKey="sparkling-authority-theme">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
