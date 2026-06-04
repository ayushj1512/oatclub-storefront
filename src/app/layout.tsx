// src/app/layout.tsx
import type { Metadata } from "next";
import { Lato, Nunito_Sans } from "next/font/google";
import LayoutClient from "./layout.client";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oatclub.in"),
  alternates: { canonical: "https://oatclub.in" },
  title: {
    default: "OATCLUB | Own All Trends",
    template: "%s | OATCLUB",
  },
  description:
    "Shop OATCLUB premium women's fashion, curated trend edits, elevated wardrobe staples, and modern occasion-ready styles.",
  keywords: [
    "OATCLUB",
    "Own All Trends",
    "women's fashion",
    "premium fashion",
    "online fashion store",
    "modern clothing",
    "trend edits",
  ],
  openGraph: {
    title: "OATCLUB | Own All Trends",
    description:
      "Premium women's fashion, sharp everyday edits, and trend-led styles curated by OATCLUB.",
    type: "website",
    siteName: "OATCLUB",
    locale: "en_IN",
    url: "https://oatclub.in",
    images: [
      {
        url: "https://oatclub.in/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "OATCLUB - Own All Trends",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OATCLUB | Own All Trends",
    description:
      "Premium women's fashion and trend-led wardrobe edits by OATCLUB.",
    images: ["https://oatclub.in/og-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${nunitoSans.variable}`}>
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
