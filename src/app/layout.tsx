// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import LayoutClient from "./layout.client";

/* ------------------------------
   Fonts
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
  metadataBase: new URL("https://oatclub.in"),

  alternates: {
    canonical: "https://oatclub.in",
  },

  title: {
    default: "OATCLUB | Premium Everyday Essentials",
    template: "%s | OATCLUB",
  },

  description:
    "Discover premium everyday essentials designed for comfort, simplicity, and modern living. Explore timeless apparel and elevated basics crafted for effortless style.",

  keywords: [
    "OATCLUB",
    "premium clothing",
    "everyday essentials",
    "minimal fashion",
    "streetwear",
    "modern apparel",
    "premium basics",
    "online clothing store",
  ],

  openGraph: {
    title: "OATCLUB | Premium Everyday Essentials",
    description:
      "Premium essentials. Timeless silhouettes. Everyday comfort. Discover elevated basics designed for modern lifestyles.",
    type: "website",
    siteName: "OATCLUB",
    locale: "en_IN",
    url: "https://oatclub.in",
    images: [
      {
        url: "https://oatclub.in/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "OATCLUB - Premium Everyday Essentials",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OATCLUB | Premium Everyday Essentials",
    description:
      "Premium essentials designed for comfort, simplicity, and modern living.",
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