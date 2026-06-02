// src/app/collection/[collection_name]/layout.jsx

const SITE_URL = "https://oatclub.in";
const BRAND_NAME = "OATCLUB";
const FALLBACK_IMAGE = `${SITE_URL}/og-collection.jpg`;

export async function generateMetadata({ params }) {
  const { collection_name } = await params;

  const name = decodeURIComponent(collection_name || "")
    .replace(/[-_]+/g, " ")
    .trim();

  const formattedName = capitalizeWords(name);

  const title = `${formattedName} Collection | OATCLUB`;

  const description = `Explore the ${formattedName} collection at OATCLUB. Curated everyday essentials, premium apparel, and timeless wardrobe pieces designed for effortless style.`;

  const url = `${SITE_URL}/collection/${collection_name}`;

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
      siteName: BRAND_NAME,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: FALLBACK_IMAGE,
          width: 1200,
          height: 630,
          alt: `${formattedName} Collection | OATCLUB`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [FALLBACK_IMAGE],
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CollectionLayout({ children }) {
  return children;
}