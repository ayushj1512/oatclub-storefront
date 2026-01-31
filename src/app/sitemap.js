// src/app/sitemap.js
// Served at: https://mirayfashions.com/sitemap.xml

const SITE_URL = "https://mirayfashions.com";

async function safeJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1h
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function slugify(input) {
  if (!input) return "";
  return String(input)
    .toLowerCase()
    .trim()
    // remove quotes etc
    .replace(/['"]/g, "")
    // replace non-alphanum with hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // trim hyphens
    .replace(/^-+|-+$/g, "");
}

function pickPrimaryCategorySlug(product) {
  // WooCommerce commonly provides categories: [{ id, name, slug }]
  const cats = product?.categories;
  if (Array.isArray(cats) && cats.length) {
    // Prefer first category; if you have a "primary category" concept, we can improve logic.
    const first = cats[0];
    return first?.slug || slugify(first?.name);
  }
  // fallback
  return "all-clothing";
}

export default async function sitemap() {
  const now = new Date();

  // 1) Static public routes (include)
  // NOTE: we intentionally DO NOT include /products in sitemap now,
  // because you're choosing the category-based product URL as canonical.
  const staticRoutes = [
    "/",
    "/about",
    "/all-clothing",
    "/bestseller",
    "/blog",
    "/cancellation-and-refund",
    "/collections",
    "/contact",
    "/exchange-and-return",
    "/faq",
    "/mission",
    "/new-arrivals",
    "/privacy-policy",
    "/recommendation",
    "/returns",
    "/shipping-policy",
    "/support",
    "/terms-and-conditions",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  // 2) Dynamic: Products -> /category/[category]/[product_name]/[id]
  const products = await safeJson(`${SITE_URL}/api/wc/products`);

  const productRoutes = Array.isArray(products)
    ? products
        .filter((p) => p && p.id)
        .map((p) => {
          const id = p.id;

          // product_name segment:
          // Prefer WooCommerce slug; fallback to name slugified
          const productName = p.slug ? slugify(p.slug) : slugify(p.name);

          // category segment:
          const categorySlug = pickPrimaryCategorySlug(p);

          // lastmod:
          const lastmodRaw =
            p.date_modified || p.modified || p.updated_at || p.updatedAt || p.date_created;
          const lastModified = lastmodRaw ? new Date(lastmodRaw) : now;

          return {
            url: `${SITE_URL}/category/${categorySlug}/${productName}/${id}`,
            lastModified,
          };
        })
        // safety: remove empty productName just in case
        .filter((x) => !x.url.endsWith("//"))
    : [];

  return [...staticRoutes, ...productRoutes];
}
