// src/app/category/[category]/[product_name]/[id]/layout.jsx

export async function generateMetadata({ params }) {
  const { id, category } = params; // ✅ removed product_name

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return fallbackMetadata();
    }

    const product = await res.json();

    const title = `${product.name} | Miray Fashions`;
    const description =
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      "Shop premium fashion at Miray Fashions";

    const image =
      product.thumbnail ||
      product.images?.[0] ||
      "https://mirayfashions.com/og-default.jpg";

    const url = `https://mirayfashions.com/${category}/${product.slug}/${id}`;

    return {
      title,
      description,

      alternates: {
        canonical: url,
      },

      openGraph: {
        title,
        description,
        url,
        siteName: "Miray Fashions",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: "en_IN",
        type: "product",
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },

      robots: {
        index: product.isActive !== false,
        follow: true,
        googleBot: {
          index: product.isActive !== false,
          follow: true,
        },
      },
    };
  } catch {
    // ✅ removed unused err
    return fallbackMetadata();
  }
}

function fallbackMetadata() {
  return {
    title: "Miray Fashions",
    description: "Shop premium fashion online at Miray Fashions",
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ProductLayout({ children }) {
  return children;
}
