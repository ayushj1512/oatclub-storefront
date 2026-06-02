// src/app/category/[category]/[product_name]/[id]/layout.jsx
// ✅ Meta Commerce: Product JSON-LD + metadata
// ✅ Title <= 65 chars
// ✅ Default availability ALWAYS InStock
// ✅ Server-only

const SITE = "https://oatclub.in";
const BRAND_NAME = "OATCLUB";
const FALLBACK_IMAGE = `${SITE}/og-default.jpg`;

const s = (v) => (v == null ? "" : String(v));
const isObjectId = (v) => /^[a-f\d]{24}$/i.test(s(v));

const toTitle = (slug = "") =>
  decodeURIComponent(s(slug))
    .replace(/-/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const cap = (txt, n) => {
  const x = s(txt).trim();
  return x.length > n ? `${x.slice(0, Math.max(0, n - 3)).trim()}...` : x;
};

const productTitle65 = (name) => cap(name, 65);

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
    ? [
        `${base}/api/products/${id}`,
        `${base}/api/product/${id}`,
        `${base}/api/v1/products/${id}`,
      ]
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

function pickName(product, product_name) {
  const raw =
    product?.name ||
    product?.title ||
    product?.productName ||
    (product?.slug ? toTitle(product.slug) : "") ||
    (product_name ? toTitle(product_name) : "") ||
    "Product";

  return {
    raw,
    name65: productTitle65(raw),
  };
}

function buildProductDescription(product, raw) {
  return (
    product?.shortDescription ||
    (product?.description ? cap(product.description, 5000) : "") ||
    `Discover ${raw} from OATCLUB. Premium everyday essentials designed for comfort, simplicity, and timeless style.`
  );
}

function pickImages(product) {
  const imgs = Array.isArray(product?.images)
    ? product.images.filter(Boolean).map(String)
    : [];

  const image = product?.thumbnail || imgs[0] || FALLBACK_IMAGE;

  return {
    image,
    imageList: Array.from(new Set([image, ...imgs])).slice(0, 10),
  };
}

function buildSchema({ product, url, product_name }) {
  if (!product) return null;

  const { raw, name65 } = pickName(product, product_name);

  const pid =
    product?.productId ||
    product?._id ||
    product?.id ||
    product?.productCode ||
    "";

  const { imageList } = pickImages(product);

  const currency = product?.currency || "INR";

  const priceNum = Number(product?.price || product?.sellingPrice || 0);
  const price =
    Number.isFinite(priceNum) && priceNum > 0 ? String(priceNum) : "0";

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: name65,
    image: imageList,
    description: buildProductDescription(product, raw),
    sku: s(pid),
    productID: s(pid),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export async function generateMetadata({ params }) {
  const { id, category, product_name } = await params;

  const product = await fetchProductSmart(id);

  const { raw, name65 } = pickName(product || {}, product_name);

  const slug = product?.slug || product_name;

  const url = `${SITE}/category/${s(category)}/${s(slug)}/${s(id)}`;

  const { image } = pickImages(product || {});

  const description =
    product?.shortDescription ||
    (product?.description ? cap(product.description, 160) : "") ||
    `Discover ${raw} from OATCLUB. Premium everyday essentials designed for comfort, simplicity, and timeless style.`;

  const isIndexable = product?.isActive !== false;

  return {
    title: name65,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: name65,
      description,
      url,
      siteName: BRAND_NAME,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${name65} | OATCLUB`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: name65,
      description,
      images: [image],
    },

    robots: {
      index: isIndexable,
      follow: true,
      googleBot: {
        index: isIndexable,
        follow: true,
      },
    },
  };
}

export default async function ProductLayout({ children, params }) {
  const { id, category, product_name } = await params;

  const product = await fetchProductSmart(id);

  const slug = product?.slug || product_name;

  const url = `${SITE}/category/${s(category)}/${s(slug)}/${s(id)}`;

  const schema = buildSchema({
    product,
    url,
    product_name,
  });

  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ) : null}

      {children}
    </>
  );
}