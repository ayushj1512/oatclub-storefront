// src/app/category/[category]/[product_name]/[id]/layout.jsx
// ✅ Fix ONLY the Meta warning: title should be <= 65 chars
// ✅ We cap: metadata.title, OG title, Twitter title, AND schema name

const SITE = "https://mirayfashions.com";
const BRAND_NAME = "Miray Fashions";

const s = (v) => (v == null ? "" : String(v));
const isObjectId = (v) => /^[a-f\d]{24}$/i.test(s(v));

const toTitle = (slug = "") =>
  decodeURIComponent(s(slug)).replace(/-/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

const cap = (txt, n) => {
  const x = s(txt).trim();
  return x.length > n ? `${x.slice(0, Math.max(0, n - 3)).trim()}...` : x;
};

// ✅ Meta wants the *Product title* <= 65 chars (not the " | Miray Fashions" part)
const productTitle65 = (name) => cap(name, 65);

// ✅ If you still want brand in SERP, keep it short overall (optional)
const pageTitle65 = (name) => cap(`${name} | ${BRAND_NAME}`, 65);

async function getJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchProductSmart(id) {
  const base = s(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, "");
  if (!base) return null;

  const candidates = isObjectId(id)
    ? [`${base}/api/products/${id}`, `${base}/api/product/${id}`, `${base}/api/v1/products/${id}`]
    : [
        `${base}/api/products/code/${encodeURIComponent(id)}`,
        `${base}/api/product/code/${encodeURIComponent(id)}`,
        `${base}/api/products/${encodeURIComponent(id)}`,
      ];

  for (const u of candidates) {
    const data = await getJson(u);
    if (data) return data;
  }
  return null;
}

function buildSchema({ product, url, product_name }) {
  if (!product) return null;

  const rawName =
    product?.name ||
    product?.title ||
    product?.productName ||
    (product?.slug ? toTitle(product.slug) : "") ||
    (product_name ? toTitle(product_name) : "") ||
    "Product";

  const pid = product?.productId || product?._id || product?.id || product?.productCode || "";

  const imgs = Array.isArray(product?.images) ? product.images.filter(Boolean).map(String) : [];
  const image = product?.thumbnail || imgs[0] || `${SITE}/og-default.jpg`;
  const imageList = Array.from(new Set([image, ...imgs])).slice(0, 10);

  const currency = product?.currency || "INR";
  const priceNum = Number(product?.price || 0);
  const price = Number.isFinite(priceNum) && priceNum > 0 ? String(priceNum) : "0";

  const stock = Number(product?.stock || 0);
  const inStock = Boolean(product?.isInStock ?? (stock > 0));
  const availability = inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productTitle65(rawName), // ✅ <= 65
    image: imageList,
    description: cap(product?.shortDescription || product?.description || "", 5000),
    sku: s(pid),
    productID: s(pid),
    brand: { "@type": "Brand", name: BRAND_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export async function generateMetadata({ params }) {
  const { id, category, product_name } = await params;
  const product = await fetchProductSmart(id);

  const rawName =
    product?.name ||
    product?.title ||
    product?.productName ||
    (product?.slug ? toTitle(product.slug) : "") ||
    (product_name ? toTitle(product_name) : "") ||
    "Product";

  const name65 = productTitle65(rawName); // ✅ <= 65

  const url = `${SITE}/category/${s(category)}/${product?.slug || product_name}/${s(id)}`;
  const image =
    product?.thumbnail ||
    (Array.isArray(product?.images) ? product.images[0] : "") ||
    `${SITE}/og-default.jpg`;

  const description =
    product?.shortDescription ||
    (product?.description ? cap(product.description, 160) : "") ||
    `Shop ${rawName} online at ${BRAND_NAME}.`;

  return {
    // ✅ IMPORTANT: keep this <= 65 to satisfy Meta's title check
    title: name65,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: name65, // ✅ <= 65
      description,
      url,
      siteName: BRAND_NAME,
      type: "website",
      locale: "en_IN",
      images: [{ url: image, width: 1200, height: 630, alt: name65 }],
    },
    twitter: {
      card: "summary_large_image",
      title: name65, // ✅ <= 65
      description,
      images: [image],
    },
    robots: {
      index: product?.isActive !== false,
      follow: true,
      googleBot: { index: product?.isActive !== false, follow: true },
    },
  };
}

export default async function ProductLayout({ children, params }) {
  const { id, category, product_name } = await params;

  const product = await fetchProductSmart(id);
  const url = `${SITE}/category/${s(category)}/${product?.slug || product_name}/${s(id)}`;

  const schema = buildSchema({ product, url, product_name });

  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}
      {children}
    </>
  );
}
