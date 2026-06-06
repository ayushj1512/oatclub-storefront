// src/lib/seo/pagesMeta.js

import { CATEGORY_KEYWORDS, SEO_KEYWORDS, buildSeoMetadata, uniqueKeywords } from "@/lib/seo/seoMeta";

const PAGES = {
  "all-clothing": {
    title: "Women Clothing Online India | OATCLUB",
    description:
      "Shop all OATCLUB women clothing online in India: premium western wear, dresses, tops, co ord sets, bottom wear, party wear and casual outfits.",
    path: "/all-clothing",
    ogImage: "/og-all-clothing.jpg",
    ogAlt: "Women Clothing Online India | OATCLUB",
    keywords: [
      "women clothing online india",
      "western wear for women",
      "modern women clothing",
      "affordable premium fashion",
    ],
  },

  "new-arrivals": {
    title: "New Arrivals Women Fashion | OATCLUB",
    description:
      "Shop OATCLUB new arrivals for trendy clothes for women, premium western wear, modern party outfits, vacation outfits and fresh everyday edits.",
    path: "/new-arrivals",
    ogImage: "/og-new-arrivals.jpg",
    ogAlt: "New Arrivals Women Fashion | OATCLUB",
    keywords: [
      "trendy clothes for women",
      "shop western wear for women online",
      "modern party wear outfits for women",
      "vacation outfits for women",
    ],
  },

  bestsellers: {
    title: "Bestseller Women Fashion India | OATCLUB",
    description:
      "Discover OATCLUB bestsellers: premium women fashion in India, statement outfits, co ord sets, dresses, tops and modern everyday clothing.",
    path: "/bestseller",
    ogImage: "/og-bestsellers.jpg",
    ogAlt: "Bestseller Women Fashion India | OATCLUB",
    keywords: [
      "premium women fashion india",
      "statement outfits for women online",
      "co ord sets for women",
      "women dresses online",
    ],
  },
};

export const buildPageMetadata = (pageKey, overrides = {}) => {
  const cfg = PAGES[pageKey];

  if (!cfg) {
    throw new Error(
      `buildPageMetadata: unknown pageKey "${pageKey}". Allowed: ${Object.keys(PAGES).join(", ")}`
    );
  }

  return buildSeoMetadata({
    title: overrides.title || cfg.title,
    description: overrides.description || cfg.description,
    path: overrides.canonical || cfg.path,
    image: overrides.ogImage || cfg.ogImage,
    imageAlt: overrides.ogAlt || cfg.ogAlt || cfg.title,
    keywords: uniqueKeywords(SEO_KEYWORDS, CATEGORY_KEYWORDS, cfg.keywords || [], overrides.keywords || []),
    robots: overrides.robots,
  });
};
