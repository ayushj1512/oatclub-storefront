// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
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
    default: "Miray Fashions | Premium Women’s Fashion Online",
    template: "%s | Miray Fashions",
  },

  description:
    "Shop premium women’s fashion at Miray Fashions. Discover kurtis, western wear, trendy outfits, and Gen-Z styles with fast delivery across India.",

  openGraph: {
    title: "Miray Fashions | Premium Women’s Fashion Online",
    description:
      "Shop premium women’s fashion at Miray Fashions. Discover kurtis, western wear, trendy outfits, and Gen-Z styles with fast delivery across India.",
    type: "website",
    siteName: "Miray Fashions",
    locale: "en_IN",
    url: "https://mirayfashions.com",
    images: [
      {
        url: "https://mirayfashions.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Miray Fashions – Premium Women’s Fashion",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Miray Fashions | Premium Women’s Fashion Online",
    description:
      "Discover premium women’s fashion and Gen-Z styles at Miray Fashions.",
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
