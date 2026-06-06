// src/app/tag/[tag_name]/layout.jsx

import { CATEGORY_KEYWORDS, buildSeoMetadata, uniqueKeywords } from "@/lib/seo/seoMeta";

export async function generateMetadata({ params }) {
  const { tag_name } = await params;

  const tag = decodeURIComponent(tag_name || "")
    .replace(/-/g, " ")
    .trim();

  const prettyTag = capitalizeWords(tag);

  const title = `${prettyTag} Outfits | OATCLUB`;

  const description = `Explore ${prettyTag} outfits at OATCLUB India. Shop premium women fashion, western wear, trendy clothes, dresses, tops, co ord sets and modern clothing online.`;

  return buildSeoMetadata({
    title,
    description,
    path: `/tag/${tag_name}`,
    image: "/og-tag.jpg",
    imageAlt: `${prettyTag} Outfits | OATCLUB`,
    keywords: uniqueKeywords([prettyTag, `${prettyTag} outfits`, `${prettyTag} women fashion`], CATEGORY_KEYWORDS),
  });
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
