// src/utils/seoConfig.js

export function generateSEO({
  title = "OATCLUB | Premium Everyday Essentials",
  description = "Explore OATCLUB — premium everyday essentials, timeless wardrobe pieces, and modern apparel designed for effortless style.",
  url = "https://oatclub.in",
  image = "https://oatclub.in/og-image.jpg",
  type = "website",
  keywords = "OATCLUB, premium clothing, everyday essentials, minimal fashion, modern apparel, premium basics, online clothing store",
  product = null,
}) {
  const metadata = {
    title,
    description,
    keywords,

    openGraph: {
      title,
      description,
      url,
      siteName: "OATCLUB",
      images: [{ url: image }],
      type,
      locale: "en_IN",
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
          name: "OATCLUB",
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