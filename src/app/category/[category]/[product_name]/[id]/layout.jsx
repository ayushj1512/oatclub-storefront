// src/app/category/[category]/[product_name]/[id]/layout.jsx

export async function generateMetadata({ params }) {
  const { id, category, product_name } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) return fallbackMetadata(category, product_name, id);

    const product = await res.json();

    // ✅ Safe Product Name (No undefined)
    const safeName =
      product?.name ||
      product?.title ||
      product?.productName ||
      (product?.slug ? slugToTitle(product.slug) : "") ||
      (product_name ? slugToTitle(product_name) : "") ||
      "Product";

    const title = `${safeName} | Miray Fashions`;

    const description =
      product?.shortDescription ||
      product?.description?.slice(0, 160) ||
      `Shop ${safeName} online at Miray Fashions.`;

    const image =
      product?.thumbnail ||
      product?.images?.[0] ||
      "https://mirayfashions.com/og-default.jpg";

    // ✅ Canonical URL (same as your folder route)
    const url = `https://mirayfashions.com/category/${category}/${product?.slug || product_name}/${id}`;

    return {
      title,
      description,

      alternates: {
        canonical: url,
      },

      openGraph: {
        title, // ✅ safe title
        description,
        url,
        siteName: "Miray Fashions",
        type: "website",
        locale: "en_IN",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: safeName,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title, // ✅ safe title
        description,
        images: [image],
      },

      robots: {
        index: product?.isActive !== false,
        follow: true,
        googleBot: {
          index: product?.isActive !== false,
          follow: true,
        },
      },
    };
  } catch {
    return fallbackMetadata(category, product_name, id);
  }
}

// ✅ Fallback metadata should also NOT show undefined
function fallbackMetadata(category, product_name, id) {
  const safeCategory = category ? slugToTitle(category) : "Category";
  const safeProduct = product_name ? slugToTitle(product_name) : "Product";

  const title = `${safeProduct} | Miray Fashions`;
  const description = `Shop ${safeProduct} in ${safeCategory} online at Miray Fashions.`;

  const url = `https://mirayfashions.com/category/${category || ""}/${product_name || ""}/${id || ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Miray Fashions",
      type: "website",
      images: [
        {
          url: "https://mirayfashions.com/og-default.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

// ✅ Converts: "blue-saree" -> "Blue Saree"
function slugToTitle(slug = "") {
  return decodeURIComponent(String(slug))
    .replace(/-/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProductLayout({ children }) {
  return children;
}
