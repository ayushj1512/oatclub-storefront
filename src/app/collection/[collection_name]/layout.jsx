// src/app/collection/[collection_name]/layout.jsx

export async function generateMetadata({ params }) {
  // ✅ Unwrap params (params may be a Promise in newer Next.js versions)
  const { collection_name } = await params;

  const name = decodeURIComponent(collection_name || "")
    .replace(/[-_]+/g, " ")
    .trim();

  const formattedName = capitalize(name);

  const title = `${formattedName} Collection | Miray Fashions`;
  const description = `Explore the ${formattedName} collection at Miray Fashions. Curated styles, premium fabrics, and statement designs crafted for modern fashion lovers.`;

  const url = `https://mirayfashions.com/collection/${collection_name}`;

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
          url: "https://mirayfashions.com/og-collection.jpg",
          width: 1200,
          height: 630,
          alt: `${formattedName} Collection – Miray Fashions`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://mirayfashions.com/og-collection.jpg"],
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

function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function CollectionLayout({ children }) {
  return children;
}
