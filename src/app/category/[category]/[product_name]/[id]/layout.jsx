// src/app/category/[category]/[product_name]/[id]/layout.jsx
// ✅ Server layout: inject Product JSON-LD in initial HTML (Meta Commerce friendly)
// ✅ Avoid hydration issues: no window/navigator, no client hooks, pure server logic

const SITE = "https://mirayfashions.com";
const BRAND_NAME = "Miray Fashions";

const s = (v) => (v == null ? "" : String(v));
const isObjectId = (v) => /^[a-f\d]{24}$/i.test(s(v));

const titleFromSlug = (slug = "") =>
  decodeURIComponent(s(slug)).replace(/-/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

const cap = (txt, n) => {
  const x = s(txt).trim();
  return x.length > n ? `${x.slice(0, Math.max(0, n - 3)).trim()}...` : x;
};

async function getJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ✅ Tries multiple endpoints so it works even if backend differs
async function fetchProductSmart(id) {
  const base = s(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, "");
  if (!base) return null;

  const candidates = isObjectId(id)
    ? [
        `${base}/api/products/${id}`,
        `${base}/api/product/${id}`,
        `${base}/api/v1/products/${id}`,
      ]
    : [
        // ✅ If you have a "by code" route, keep these
        `${base}/api/products/code/${encodeURIComponent(id)}`,
        `${base}/api/product/code/${encodeURIComponent(id)}`,
        // fallback (some backends accept code on same route)
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

  // ✅ Safe title (Meta warning: keep <= 65 chars in schema)
  const name =
    product?.name ||
    product?.title ||
    product?.productName ||
    (product?.slug ? titleFromSlug(product.slug) : "") ||
    (product_name ? titleFromSlug(product_name) : "") ||
    "Product";

  // ✅ ID: Meta requires unique identifier (use productId/_id/productCode)
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
    name: cap(name, 65),
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

// ✅ Metadata stays server-side (no hydration risk)
export async function generateMetadata({ params }) {
  const { id, category, product_name } = await params;
  const product = await fetchProductSmart(id);

  const name =
    product?.name ||
    product?.title ||
    product?.productName ||
    (product?.slug ? titleFromSlug(product.slug) : "") ||
    (product_name ? titleFromSlug(product_name) : "") ||
    "Product";

  const url = `${SITE}/category/${s(category)}/${product?.slug || product_name}/${s(id)}`;
  const image =
    product?.thumbnail ||
    (Array.isArray(product?.images) ? product.images[0] : "") ||
    `${SITE}/og-default.jpg`;

  const title = `${name} | ${BRAND_NAME}`;
  const description =
    product?.shortDescription ||
    (product?.description ? cap(product.description, 160) : "") ||
    `Shop ${name} online at ${BRAND_NAME}.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND_NAME,
      type: "website",
      locale: "en_IN",
      images: [{ url: image, width: 1200, height: 630, alt: name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: {
      index: product?.isActive !== false,
      follow: true,
      googleBot: { index: product?.isActive !== false, follow: true },
    },
  };
}

// ✅ Server Layout: inject JSON-LD in initial HTML so Meta crawler picks it up
export default async function ProductLayout({ children, params }) {
  const { id, category, product_name } = await params;
  const product = await fetchProductSmart(id);

  const url = `${SITE}/category/${s(category)}/${product?.slug || product_name}/${s(id)}`;
  const schema = buildSchema({ product, url, product_name });

  return (
    <>
      {/* ✅ No hydration issues: server renders this <script> once */}
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
