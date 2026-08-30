// src/app/sitemap.js

const SITE_URL = "https://www.oatclub.in";
const API_BASE = "https://api.oatclub.in";

async function safeJson(url) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

function slugify(value = "") {
  return String(value)
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
  const categories = product?.categories;

  if (!Array.isArray(categories) || !categories.length) {
    return "shop";
  }

  const category = categories[0];

  if (typeof category === "string") {
    return slugify(category) || "shop";
  }

  return (
    slugify(
      category?.slug ||
      category?.name ||
      category?.title
    ) || "shop"
  );
}

async function fetchAllProducts() {
  const products = [];
  const LIMIT = 100;

  const first = await safeJson(
    `${API_BASE}/api/products?page=1&limit=${LIMIT}`
  );

  if (!first) return [];

  const getProducts = (data) => {
    if (Array.isArray(data?.products)) {
      return data.products;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  };

  products.push(...getProducts(first));

  const totalPages = Number(
    first?.pages ||
    first?.totalPages ||
    1
  );

  for (let page = 2; page <= totalPages; page++) {
    const data = await safeJson(
      `${API_BASE}/api/products?page=${page}&limit=${LIMIT}`
    );

    const batch = getProducts(data);

    if (!batch.length) break;

    products.push(...batch);
  }

  const seen = new Set();

  return products.filter((product) => {
    const id = String(
      product?._id ||
      product?.id ||
      ""
    );

    if (!id || seen.has(id)) {
      return false;
    }

    const status = String(
      product?.status ||
      product?.productStatus ||
      ""
    )
      .toLowerCase()
      .trim();

    const hidden =
      product?.isDeleted === true ||
      product?.deleted === true ||
      product?.isArchived === true ||
      product?.archived === true ||
      product?.isDraft === true ||
      ["draft", "inactive", "disabled"].includes(status);

    if (hidden) {
      return false;
    }

    seen.add(id);

    return true;
  });
}

export default async function sitemap() {
  const products = await fetchAllProducts();

  const productDates = products
    .map((product) =>
      getValidDate(
        product?.updatedAt ||
        product?.createdAt ||
        product?.publishAt,
        null
      )
    )
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());

  const latestProductUpdate =
    productDates[0] || new Date();

  /*
   * MAIN SEO + QUICK LINKS + SUPPORT PAGES
   */
  const staticRoutes = [
    // Homepage
    {
      path: "/",
      priority: 1,
      changeFrequency: "daily",
    },

    // Core commercial pages
    {
      path: "/new-arrivals",
      priority: 1,
      changeFrequency: "daily",
    },
    {
      path: "/all-clothing",
      priority: 0.98,
      changeFrequency: "daily",
    },
    {
      path: "/bestseller",
      priority: 0.96,
      changeFrequency: "daily",
    },

    // Main categories
    {
      path: "/category/tops",
      priority: 0.95,
      changeFrequency: "daily",
    },
    {
      path: "/category/dresses",
      priority: 0.95,
      changeFrequency: "daily",
    },
    {
      path: "/category/co-ord-sets",
      priority: 0.95,
      changeFrequency: "daily",
    },
    {
      path: "/category/bottoms",
      priority: 0.95,
      changeFrequency: "daily",
    },

    // Blog
    {
      path: "/blog",
      priority: 0.85,
      changeFrequency: "weekly",
    },

    // Quick links
    {
      path: "/about",
      priority: 0.6,
      changeFrequency: "monthly",
    },
    {
      path: "/contact",
      priority: 0.55,
      changeFrequency: "monthly",
    },

    // Support pages
    {
      path: "/support",
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      path: "/faq",
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      path: "/shipping-policy",
      priority: 0.45,
      changeFrequency: "monthly",
    },
    {
      path: "/exchange-and-return",
      priority: 0.45,
      changeFrequency: "monthly",
    },
    {
      path: "/cancellation-and-refund",
      priority: 0.45,
      changeFrequency: "monthly",
    },
    {
      path: "/privacy-policy",
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      path: "/terms-and-conditions",
      priority: 0.3,
      changeFrequency: "yearly",
    },
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: latestProductUpdate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  /*
   * Prevent main category duplicates
   */
  const importantCategories = new Set([
    "tops",
    "dresses",
    "co-ord-sets",
    "bottoms",
  ]);

  /*
   * Other genuine product categories
   */
  const categorySlugs = [
    ...new Set(
      products
        .map(pickCategorySlug)
        .filter(
          (slug) =>
            slug &&
            slug !== "shop" &&
            !importantCategories.has(slug)
        )
    ),
  ];

  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: latestProductUpdate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  /*
   * Product pages
   */
  const productRoutes = products.map((product) => {
    const id = String(
      product?._id ||
      product?.id
    );

    const category =
      pickCategorySlug(product);

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
        latestProductUpdate
      ),

      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
  ];
}
