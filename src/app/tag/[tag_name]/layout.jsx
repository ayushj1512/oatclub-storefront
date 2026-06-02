// src/app/tag/[tag_name]/layout.jsx

const SITE_URL = "https://oatclub.in";
const BRAND_NAME = "OATCLUB";
const FALLBACK_IMAGE = `${SITE_URL}/og-tag.jpg`;

export async function generateMetadata({ params }) {
  const { tag_name } = await params;

  const tag = decodeURIComponent(tag_name || "")
    .replace(/-/g, " ")
    .trim();

  const prettyTag = capitalizeWords(tag);

  const title = `${prettyTag} | OATCLUB`;

  const description = `Explore ${prettyTag} at OATCLUB. Discover curated essentials, premium apparel, and timeless pieces designed for everyday comfort and modern living.`;

  const url = `${SITE_URL}/tag/${tag_name}`;

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
          alt: `${prettyTag} | OATCLUB`,
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
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

export default function TagLayout({ children }) {
  return children;
}