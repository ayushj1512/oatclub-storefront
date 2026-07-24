// src/app/layout.tsx

import type { Metadata } from "next";
import { Lato, Nunito_Sans } from "next/font/google";

import LayoutClient from "./layout.client";
import {
  CATEGORY_KEYWORDS,
  SEO_KEYWORDS,
} from "@/lib/seo/seoMeta";

const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID || "GTM-55DGB55Q";

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

  alternates: {
    canonical: "https://oatclub.in",
  },

  title: {
    default: "OATCLUB | Premium Women Fashion Online India",
    template: "%s | OATCLUB",
  },

  description:
    "Shop OATCLUB for premium women fashion online in India: western wear, co ord sets, dresses, tops, bottom wear, party wear, casual wear and modern outfits.",

  applicationName: "OATCLUB",
  category: "Fashion",

  keywords: [...SEO_KEYWORDS, ...CATEGORY_KEYWORDS],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "OATCLUB | Premium Women Fashion Online India",
    description:
      "Premium women fashion, western wear, co ord sets, dresses, tops and trend-led outfits curated by OATCLUB India.",
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
    title: "OATCLUB | Premium Women Fashion Online India",
    description:
      "Shop OATCLUB women clothing online in India: premium western wear, co ord sets, dresses, tops and modern outfits.",
    images: ["https://oatclub.in/og-default.jpg"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
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
    <html
      lang="en"
      className={`${lato.variable} ${nunitoSans.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
