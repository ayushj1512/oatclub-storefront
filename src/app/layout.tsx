// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import LayoutClient from "./layout.client";

/* ------------------------------
   Fonts (Self-hosted, premium)
------------------------------ */

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

/* ------------------------------
   SEO Metadata + Favicons
------------------------------ */

export const metadata: Metadata = {
  metadataBase: new URL("https://mirayfashions.com"),

  alternates: {
    canonical: "https://mirayfashions.com",
  },

  title: {
    default: "Miray Fashions | Trending Women’s Fashion Online",
    template: "%s | Miray Fashions",
  },

  description:
    "Shop trending women’s fashion at Miray Fashions. Discover stylish tops, dresses, shirts, co-ord sets, and fresh Gen-Z styles designed for confident, effortless everyday wear.",

  openGraph: {
    title: "Miray Fashions | Trending Women’s Fashion Online",
    description:
      "Discover customer-first women’s fashion for Gen-Z and millennials. Shop trending tops, dresses, shirts, co-ord sets, and statement styles made for confident everyday wear.",
    type: "website",
    siteName: "Miray Fashions",
    locale: "en_IN",
    url: "https://mirayfashions.com",
    images: [
      {
        url: "https://mirayfashions.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Miray Fashions – Trending Women’s Fashion",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Miray Fashions | Trending Women’s Fashion Online",
    description:
      "Shop trending tops, dresses, shirts, co-ord sets, and Gen-Z women’s fashion at Miray Fashions.",
    images: ["https://mirayfashions.com/og-default.jpg"],
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

/* ------------------------------
   Root Layout
------------------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${bebas.variable}`}>
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}