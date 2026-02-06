// src/app/sitemap.js
// ✅ Uses backend: https://error.mirayfashions.com/api/products
// ✅ Fetches ALL pages (total/pages) and returns ALL product URLs
// ✅ Meta will discover all products via sitemap
// ✅ No hydration issues (server-only)

const SITE_URL = "https://www.mirayfashions.com";
const API_BASE = "https://error.mirayfashions.com";

async function safeJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" }); // ✅ crawl-friendly
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
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickCategorySlug(p) {
  // your backend: categories: ["trousers"] OR could be objects in some cases
  const cats = p?.categories;
  if (Array.isArray(cats) && cats.length) {
    const first = cats[0];
    if (typeof first === "string") return slugify(first) || "all-clothing";
    return slugify(first?.slug || first?.name) || "all-clothing";
  }
  return "all-clothing";
}

async function fetchAllProducts() {
  const out = [];
  const LIMIT = 20; // your API seems to paginate (pages=15). Keep safe.
  const first = await safeJson(`${API_BASE}/api/products?page=1&limit=${LIMIT}`);
  if (!first) return out;

  const pages = Number(first?.pages || 1);
  const firstBatch = Array.isArray(first?.products) ? first.products : [];
  out.push(...firstBatch);

  for (let page = 2; page <= pages; page++) {
    const data = await safeJson(`${API_BASE}/api/products?page=${page}&limit=${LIMIT}`);
    const batch = Array.isArray(data?.products) ? data.products : [];
    if (batch.length === 0) break;
    out.push(...batch);
  }

  // ✅ de-dupe by _id
  const seen = new Set();
  return out.filter((p) => {
    const id = String(p?._id || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export default async function sitemap() {
  const now = new Date();

  // ✅ static routes (optional)
  const staticRoutes = [
    "/",
    "/all-clothing",
    "/new-arrivals",
    "/bestseller",
    "/collections",
    "/contact",
    "/support",
    "/returns",
    "/shipping-policy",
    "/privacy-policy",
    "/terms-and-conditions",
  ].map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now }));

  const products = await fetchAllProducts();

  const productRoutes = products.map((p) => {
    const id = String(p?._id || "");
    const category = pickCategorySlug(p);
    const slug = slugify(p?.slug || p?.title || "product");

    const lastmodRaw = p?.updatedAt || p?.createdAt || p?.publishAt;
    const lastModified = lastmodRaw ? new Date(lastmodRaw) : now;

    return {
      url: `${SITE_URL}/category/${category}/${slug}/${id}`,
      lastModified,
    };
  });

  return [...staticRoutes, ...productRoutes];
}
