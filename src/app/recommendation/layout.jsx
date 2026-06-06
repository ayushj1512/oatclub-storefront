// src/app/recommendation/layout.jsx

import { buildSeoMetadata } from "@/lib/seo/seoMeta";

export async function generateMetadata() {
  return buildSeoMetadata({
    title: "Recommended Women Outfits | OATCLUB",
    description:
      "Explore personalized OATCLUB recommendations for premium women fashion, western wear, co ord sets, dresses, tops, party wear and modern everyday outfits.",
    path: "/recommendation",
    image: "/og-default.jpg",
    imageAlt: "Recommended Women Outfits | OATCLUB",
    keywords: [
      "recommended outfits for women",
      "statement outfits for women online",
      "modern women clothing",
      "trendy clothes for women",
      "minimal everyday outfits for women",
    ],
  });
}

export default function RecommendationLayout({ children }) {
  return children;
}
