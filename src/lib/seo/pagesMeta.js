// src/lib/seo/pagesMeta.js

const SITE = {
  name: "Miray Fashions",
  url: "https://mirayfashions.com",
  locale: "en_IN",
  twitterCard: "summary_large_image",
};

// ✅ One place to manage page-wise meta
const PAGES = {
  "all-clothing": {
    title: "All Clothing | Miray Fashions",
    description:
      "Explore all clothing from Miray Fashions — modern western wear, Gen-Z aesthetics, and curated styles for every vibe.",
    path: "/all-clothing",
    ogImage: "/og-all-clothing.jpg", // put in /public or use absolute
    ogAlt: "All Clothing – Miray Fashions",
  },
  "new-arrivals": {
    title: "New Arrivals | Miray Fashions",
    description:
      "Shop New Arrivals from Miray Fashions — the latest drops, trending fits, and fresh styles updated regularly.",
    path: "/new-arrivals",
    ogImage: "/og-new-arrivals.jpg",
    ogAlt: "New Arrivals – Miray Fashions",
  },
  bestsellers: {
    title: "Bestsellers | Miray Fashions",
    description:
      "Discover Miray Fashions Bestsellers — customer favourites, top-selling styles, and trending western wear picks.",
    path: "/bestseller",
    ogImage: "/og-bestsellers.jpg",
    ogAlt: "Bestsellers – Miray Fashions",
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
      `buildPageMetadata: unknown pageKey "${pageKey}". Allowed: ${Object.keys(PAGES).join(
        ", "
      )}`
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
      googleBot: { index: true, follow: true },
    },
  };
};
