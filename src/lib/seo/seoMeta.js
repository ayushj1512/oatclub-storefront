export const SITE = {
  name: "OATCLUB",
  url: "https://oatclub.in",
  locale: "en_IN",
  tagline: "Own All Trends",
  defaultImage: "https://oatclub.in/og-default.jpg",
};

export const SEO_KEYWORDS = [
  "women fashion online india",
  "women clothing online india",
  "western wear for women",
  "premium women fashion india",
  "trendy clothes for women",
  "women co ord sets",
  "co ord sets for women",
  "women dresses online",
  "tops for women",
  "bottom wear for women",
  "party wear for women",
  "casual wear for women",
  "resort wear women",
  "minimal fashion women",
  "modern women clothing",
  "affordable premium fashion",
  "OATCLUB",
  "OATCLUB India",
  "OATCLUB fashion",
  "OATCLUB women",
  "Own All Trends",
  "OATCLUB clothing",
  "OATCLUB co ord sets",
  "premium co ord sets for women in India",
  "shop western wear for women online",
  "minimal everyday outfits for women",
  "modern party wear outfits for women",
  "vacation outfits for women",
  "trendy college outfits for women",
  "affordable luxury women clothing India",
  "statement outfits for women online",
];

export const CATEGORY_KEYWORDS = [
  "co ord sets for women",
  "casual co ord sets",
  "crop tops for women",
  "shirts for women",
  "dresses for women",
  "maxi dresses for women",
  "mini dresses for women",
  "women trousers",
  "women skirts",
  "women denim",
  "women tops online",
  "western tops for women",
  "party tops for women",
];

export const absUrl = (path = "") => {
  if (!path) return SITE.url;
  if (String(path).startsWith("http")) return path;
  return `${SITE.url}${String(path).startsWith("/") ? "" : "/"}${path}`;
};

export const uniqueKeywords = (...groups) =>
  Array.from(new Set(groups.flat().filter(Boolean).map((item) => String(item).trim())));

export const truncate = (value = "", max = 160) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 3).trim()}...` : text;
};

export function buildSeoMetadata({
  title,
  description,
  path = "/",
  image = SITE.defaultImage,
  imageAlt,
  type = "website",
  keywords = [],
  robots,
}) {
  const canonical = absUrl(path);
  const imageUrl = absUrl(image);
  const finalKeywords = uniqueKeywords(SEO_KEYWORDS, keywords);

  return {
    title,
    description: truncate(description, 170),
    keywords: finalKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: truncate(description, 200),
      url: canonical,
      siteName: SITE.name,
      type,
      locale: SITE.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: truncate(description, 200),
      images: [imageUrl],
    },
    robots: robots || {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
