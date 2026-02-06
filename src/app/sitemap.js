// src/app/sitemap.js
// ✅ Sitemap built by crawling /all-clothing pages (server-side)
// ✅ Works even if backend API is gone
// ✅ Meta Commerce compatible

const SITE = "https://www.mirayfashions.com";

async function fetchHTML(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

// ✅ Extract product URLs from HTML
function extractProductUrls(html) {
  const urls = new Set();

  // matches: /category/xxx/yyy/123
  const regex = /href="(\/category\/[^"]+)"/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const path = match[1];
    if (path.includes("/category/")) {
      urls.add(`${SITE}${path}`);
    }
  }

  return Array.from(urls);
}

export default async function sitemap() {
  const now = new Date();

  /* ---------- Static pages ---------- */
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
  ].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
  }));

  /* ---------- Crawl all-clothing pagination ---------- */
  const productUrls = new Set();
  const MAX_PAGES = 20; // enough for 285 products

  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchHTML(`${SITE}/all-clothing?page=${page}`);
    if (!html) break;

    const urls = extractProductUrls(html);
    if (urls.length === 0) break; // ✅ no more products

    urls.forEach((u) => productUrls.add(u));
  }

  const productRoutes = Array.from(productUrls).map((url) => ({
    url,
    lastModified: now,
  }));

  console.log("🧭 Sitemap products:", productRoutes.length);

  return [...staticRoutes, ...productRoutes];
}
