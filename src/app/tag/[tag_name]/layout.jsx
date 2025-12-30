// src/app/tag/[tag_name]/layout.jsx

export async function generateMetadata({ params }) {
  const { tag_name } = params;

  const tag = decodeURIComponent(tag_name || "")
    .replace(/-/g, " ")
    .trim();

  const prettyTag = capitalize(tag);

  const title = `${prettyTag} Styles & Products | Miray Fashions`;
  const description = `Shop ${prettyTag} styles at Miray Fashions. Explore curated designs, trending outfits, and premium fashion tagged with ${prettyTag}.`;

  const url = `https://mirayfashions.com/tag/${tag_name}`;

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
      siteName: "Miray Fashions",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: "https://mirayfashions.com/og-tag.jpg",
          width: 1200,
          height: 630,
          alt: `${prettyTag} styles – Miray Fashions`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://mirayfashions.com/og-tag.jpg"],
    },

    robots: {
      index: true,   // ✅ ENABLED
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function TagLayout({ children }) {
  return children;
}
