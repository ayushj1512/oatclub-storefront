// src/lib/seo/pagesMeta.js

const SITE = {
  name: "OATCLUB",
  url: "https://oatclub.in",
  locale: "en_IN",
  twitterCard: "summary_large_image",
};

const PAGES = {
  "all-clothing": {
    title: "All Clothing | OATCLUB",
    description:
      "Explore all clothing from OATCLUB — premium everyday essentials, timeless wardrobe pieces, and modern apparel designed for effortless style.",
    path: "/all-clothing",
    ogImage: "/og-all-clothing.jpg",
    ogAlt: "All Clothing | OATCLUB",
  },

  "new-arrivals": {
    title: "New Arrivals | OATCLUB",
    description:
      "Shop new arrivals from OATCLUB — fresh essentials, premium apparel, and timeless pieces designed for modern everyday wear.",
    path: "/new-arrivals",
    ogImage: "/og-new-arrivals.jpg",
    ogAlt: "New Arrivals | OATCLUB",
  },

  bestsellers: {
    title: "Bestsellers | OATCLUB",
    description:
      "Discover OATCLUB bestsellers — customer-loved essentials, premium basics, and timeless wardrobe pieces made for everyday comfort.",
    path: "/bestseller",
    ogImage: "/og-bestsellers.jpg",
    ogAlt: "Bestsellers | OATCLUB",
  },
};

const abs = (p) => {
  if (!p) return undefined;
  if (String(p).startsWith("http")) return p;
  return `${SITE.url}${String(p).startsWith("/") ? "" : "/"}${p}`;
};

export const buildPageMetadata = (pageKey, overrides = {}) => {
  const cfg = PAGES[pageKey];

  if (!cfg) {
    throw new Error(
      `buildPageMetadata: unknown pageKey "${pageKey}". Allowed: ${Object.keys(
        PAGES
      ).join(", ")}`
    );
  }

  const title = overrides.title || cfg.title;
  const description = overrides.description || cfg.description;

  const canonical = overrides.canonical || abs(cfg.path);
  const ogImage = abs(overrides.ogImage || cfg.ogImage);

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title: overrides.ogTitle || title,
      description: overrides.ogDescription || description,
      url: canonical,
      siteName: SITE.name,
      type: "website",
      locale: SITE.locale,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: overrides.ogAlt || cfg.ogAlt || title,
            },
          ]
        : [],
    },

    twitter: {
      card: SITE.twitterCard,
      title: overrides.twitterTitle || title,
      description: overrides.twitterDescription || description,
      images: ogImage ? [ogImage] : [],
    },

    robots: overrides.robots || {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
};