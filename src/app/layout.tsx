import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} min-h-screen bg-sky-50/80 dark:bg-gray-900`}>
        <ThemeProvider defaultTheme="system" storageKey="sparkling-authority-theme">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
