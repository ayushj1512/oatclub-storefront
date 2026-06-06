// src/app/category/[category]/layout.jsx

import { CATEGORY_KEYWORDS, buildSeoMetadata, uniqueKeywords } from "@/lib/seo/seoMeta";

export async function generateMetadata({ params }) {
  const { category } = await params;

  const name = decodeURIComponent(category || "")
    .replace(/-/g, " ")
    .trim();

  const formattedName = capitalizeWords(name);

  const title = `${formattedName} For Women | OATCLUB`;

  const description = `Shop ${formattedName} for women at OATCLUB India. Discover premium women fashion, western wear, modern outfits, party wear, casual wear and trend-led clothing online.`;

  return buildSeoMetadata({
    title,
    description,
    path: `/category/${category}`,
    image: "/og-category.jpg",
    imageAlt: `${formattedName} For Women | OATCLUB`,
    keywords: uniqueKeywords([formattedName, `${formattedName} for women`, `${formattedName} online`], CATEGORY_KEYWORDS),
  });
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
