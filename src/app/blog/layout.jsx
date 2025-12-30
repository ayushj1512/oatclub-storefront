// src/app/blog/layout.jsx

export const metadata = {
  title: "The Miray Journal | Fashion, Styling & Trends",
  description:
    "Explore The Miray Journal — fashion trends, styling tips, Gen-Z aesthetics, and modern western wear stories curated by Miray Fashions.",

  alternates: {
    canonical: "https://mirayfashions.com/blog",
  },

  openGraph: {
    title: "The Miray Journal | Miray Fashions",
    description:
      "Fashion trends, styling inspiration, and Gen-Z aesthetics from Miray Fashions.",
    url: "https://mirayfashions.com/blog",
    siteName: "Miray Fashions",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://mirayfashions.com/og-blog.jpg",
        width: 1200,
        height: 630,
        alt: "The Miray Journal – Fashion Blog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "The Miray Journal | Miray Fashions",
    description:
      "Read fashion stories, styling tips & trends curated by Miray Fashions.",
    images: ["https://mirayfashions.com/og-blog.jpg"],
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
