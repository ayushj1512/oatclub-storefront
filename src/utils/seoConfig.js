// src/utils/seoConfig.js

import { SEO_KEYWORDS, SITE, uniqueKeywords } from "@/lib/seo/seoMeta";

export function generateSEO({
  title = "OATCLUB | Premium Women Fashion Online India",
  description = "Shop OATCLUB for premium women fashion online in India: western wear, co ord sets, dresses, tops, bottom wear, party wear and modern outfits.",
  url = SITE.url,
  image = "https://oatclub.in/og-image.jpg",
  type = "website",
  keywords = SEO_KEYWORDS,
  product = null,
}) {
  const finalKeywords = Array.isArray(keywords)
    ? uniqueKeywords(SEO_KEYWORDS, keywords)
    : uniqueKeywords(SEO_KEYWORDS, String(keywords).split(","));

  const metadata = {
    title,
    description,
    keywords: finalKeywords,

    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      images: [{ url: image }],
      type,
      locale: SITE.locale,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  const structuredData = product
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: [product.image],
        description: product.description,
        sku: product.sku || product.id,
        brand: {
          "@type": "Brand",
          name: SITE.name,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.price,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url,
        },
      }
    : null;

  return {
    metadata,
    structuredData,
  };
}
