import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({
 subsets: ['latin'],
 weight: '400',
});

export const metadata: Metadata = {
 title: "IEEE Day 2025 NSBM - Platform",
 description: "NSBM Green University",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en">
  <body
  className={`${inter.className} font-secondary antialiased select-none `}
  >
  {children}
  </body>
 </html>
 );
}
