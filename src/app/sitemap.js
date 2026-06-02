// src/app/sitemap.js

const SITE_URL = "https://oatclub.in";
const API_BASE = "https://api.oatclub.in";

async function safeJson(url) {
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

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
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getValidDate(value, fallback = new Date()) {
  if (!value) return fallback;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function pickCategorySlug(product) {
  const cats = product?.categories;

  if (Array.isArray(cats) && cats.length > 0) {
    const first = cats[0];

    if (typeof first === "string") {
      return slugify(first) || "shop";
    }

    return slugify(first?.slug || first?.name || first?.title) || "shop";
  }

  return "shop";
}

async function fetchAllProducts() {
  const products = [];
  const LIMIT = 50;

  const first = await safeJson(
    `${API_BASE}/api/products?page=1&limit=${LIMIT}`
  );

  if (!first) return products;

  const totalPages = Number(first?.pages || first?.totalPages || 1);

  const firstBatch = Array.isArray(first?.products)
    ? first.products
    : Array.isArray(first?.data)
      ? first.data
      : [];

  products.push(...firstBatch);

  for (let page = 2; page <= totalPages; page++) {
    const data = await safeJson(
      `${API_BASE}/api/products?page=${page}&limit=${LIMIT}`
    );

    const batch = Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data?.data)
        ? data.data
        : [];

    if (!batch.length) break;

    products.push(...batch);
  }

  const seen = new Set();

  return products.filter((product) => {
    const id = String(product?._id || product?.id || "");

    if (!id || seen.has(id)) return false;

    const status = String(
      product?.status || product?.productStatus || ""
    )
      .toLowerCase()
      .trim();

    const isHidden =
      product?.isDeleted === true ||
      product?.deleted === true ||
      product?.isArchived === true ||
      product?.archived === true ||
      product?.isDraft === true ||
      status === "draft" ||
      status === "inactive" ||
      status === "disabled";

    if (isHidden) return false;

    seen.add(id);
    return true;
  });
}

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    {
      path: "/",
      priority: 1,
      changeFrequency: "daily",
    },
    {
      path: "/shop",
      priority: 0.95,
      changeFrequency: "daily",
    },
    {
      path: "/new-arrivals",
      priority: 0.9,
      changeFrequency: "daily",
    },
    {
      path: "/bestsellers",
      priority: 0.9,
      changeFrequency: "weekly",
    },
    {
      path: "/collections",
      priority: 0.85,
      changeFrequency: "weekly",
    },
    {
      path: "/about",
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      path: "/contact",
      priority: 0.6,
      changeFrequency: "monthly",
    },
    {
      path: "/support",
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      path: "/returns",
      priority: 0.45,
      changeFrequency: "monthly",
    },
    {
      path: "/shipping-policy",
      priority: 0.45,
      changeFrequency: "monthly",
    },
    {
      path: "/privacy-policy",
      priority: 0.35,
      changeFrequency: "yearly",
    },
    {
      path: "/terms-and-conditions",
      priority: 0.35,
      changeFrequency: "yearly",
    },
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const products = await fetchAllProducts();

  const categorySlugs = Array.from(
    new Set(
      products
        .map((product) => pickCategorySlug(product))
        .filter(Boolean)
    )
  );

  const categoryRoutes = categorySlugs.map((category) => ({
    url: `${SITE_URL}/category/${category}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const productRoutes = products.map((product) => {
    const id = String(product?._id || product?.id || "");
    const category = pickCategorySlug(product);

    const slug = slugify(
      product?.slug ||
      product?.title ||
      product?.name ||
      "product"
    );

    return {
      url: `${SITE_URL}/category/${category}/${slug}/${id}`,
      lastModified: getValidDate(
        product?.updatedAt ||
          product?.createdAt ||
          product?.publishAt,
        now
      ),
      changeFrequency: "weekly",
      priority: 0.9,
    };
  });

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
  ];
}