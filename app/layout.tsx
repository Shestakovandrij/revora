import type { Metadata } from "next";
import { Urbanist, Inter_Tight } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "REVORA MOVE — Compare & book verified movers across the UK",
    template: "%s · REVORA MOVE",
  },
  description:
    "Get instant quotes from verified UK carriers, compare prices and ratings, and book your move online. No upfront payment — pay your driver directly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${interTight.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-ink">{children}</body>
    </html>
  );
}
