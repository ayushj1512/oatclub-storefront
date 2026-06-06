// src/app/collection/[collection_name]/layout.jsx

import { CATEGORY_KEYWORDS, buildSeoMetadata, uniqueKeywords } from "@/lib/seo/seoMeta";

export async function generateMetadata({ params }) {
  const { collection_name } = await params;

  const name = decodeURIComponent(collection_name || "")
    .replace(/[-_]+/g, " ")
    .trim();

  const formattedName = capitalizeWords(name);

  const title = `${formattedName} Collection | OATCLUB`;

  const description = `Explore the ${formattedName} collection at OATCLUB India. Shop premium women fashion, western wear, trend-led outfits, co ord sets, dresses, tops and modern clothing online.`;

  return buildSeoMetadata({
    title,
    description,
    path: `/collection/${collection_name}`,
    image: "/og-collection.jpg",
    imageAlt: `${formattedName} Collection | OATCLUB`,
    keywords: uniqueKeywords([formattedName, `${formattedName} collection`, `${formattedName} outfits`], CATEGORY_KEYWORDS),
  });
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
