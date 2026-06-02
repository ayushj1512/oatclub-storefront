// src/app/category/[category]/layout.jsx

const SITE_URL = "https://oatclub.in";

export async function generateMetadata({ params }) {
  const { category } = await params;

  const name = decodeURIComponent(category || "")
    .replace(/-/g, " ")
    .trim();

  const formattedName = capitalizeWords(name);

  const title = `${formattedName} | OATCLUB`;

  const description = `Explore ${formattedName} at OATCLUB. Discover thoughtfully designed everyday essentials, premium apparel, and timeless wardrobe pieces.`;

  const url = `${SITE_URL}/category/${category}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: "OATCLUB",
      type: "website",
      locale: "en_IN",

      images: [
        {
          url: `${SITE_URL}/og-category.jpg`,
          width: 1200,
          height: 630,
          alt: `${formattedName} | OATCLUB`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-category.jpg`],
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
}

function capitalizeWords(str = "") {
  return str
    .split(" ")
    .filter(Boolean)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

export default function CategoryLayout({ children }) {
  return children;
}