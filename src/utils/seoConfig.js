// src/utils/seoConfig.js

export function generateSEO({
  title = "Miray Fashions | Luxury Made Accessible",
  description = "Explore Miray Fashions – luxury clothing made accessible. Discover timeless Indian designs crafted with love and sustainability.",
  url = "https://mirayfashions.com",
  image = "https://mirayfashions.com/og-image.jpg",
  type = "website",
  keywords = "Indian fashion, ethnic wear, sarees, sustainable fashion, Miray Fashions",
  product = null, // optional product details for structured data
}) {
  const metadata = {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image }],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  // Add schema.org Product markup if product is provided
  const structuredData = product
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: [product.image],
        description: product.description,
        sku: product.sku || product.id,
        brand: { "@type": "Brand", name: "Miray Fashions" },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.price,
          availability: "https://schema.org/InStock",
          url,
        },
      }
    : null;

  return { metadata, structuredData };
}
