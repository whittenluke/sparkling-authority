import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
