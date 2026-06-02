// src/app/blog/layout.jsx

export const metadata = {
  title: "The OATCLUB Journal | Style, Culture & Everyday Essentials",

  description:
    "Explore The OATCLUB Journal — style guides, everyday essentials, modern culture, design inspiration, and stories behind intentional living.",

  alternates: {
    canonical: "https://oatclub.in/blog",
  },

  openGraph: {
    title: "The OATCLUB Journal | OATCLUB",

    description:
      "Style guides, everyday essentials, culture, design inspiration, and modern lifestyle stories from OATCLUB.",

    url: "https://oatclub.in/blog",

    siteName: "OATCLUB",

    type: "website",

    locale: "en_IN",

    images: [
      {
        url: "https://oatclub.in/og-blog.jpg",
        width: 1200,
        height: 630,
        alt: "The OATCLUB Journal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "The OATCLUB Journal | OATCLUB",

    description:
      "Read style guides, culture stories, and everyday inspiration from OATCLUB.",

    images: ["https://oatclub.in/og-blog.jpg"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function BlogLayout({ children }) {
  return children;
}