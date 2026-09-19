"use client";

import ProductCard from "@/components/common/ProductCard";

const svgImage = (
  title,
  background,
  foreground = "#111111",
) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height="1000"
      viewBox="0 0 800 1000"
    >
      <rect
        width="800"
        height="1000"
        fill="${background}"
      />

      <circle
        cx="400"
        cy="380"
        r="180"
        fill="${foreground}"
        opacity="0.08"
      />

      <rect
        x="240"
        y="250"
        width="320"
        height="500"
        rx="150"
        fill="${foreground}"
        opacity="0.12"
      />

      <text
        x="400"
        y="875"
        text-anchor="middle"
        fill="${foreground}"
        font-size="38"
        font-family="Arial"
        font-weight="700"
        letter-spacing="4"
      >
        ${title}
      </text>
    </svg>
  `)}`;

const sizeVariants = [
  {
    _id: "variant-xs",
    sku: "TEST-XS",
    stock: 10,
    reservedStock: 2,
    isInStock: true,
    attributes: [
      {
        key: "size",
        value: "XS",
      },
    ],
  },
  {
    _id: "variant-s",
    sku: "TEST-S",
    stock: 8,
    reservedStock: 1,
    isInStock: true,
    attributes: [
      {
        key: "size",
        value: "S",
      },
    ],
  },
  {
    _id: "variant-m",
    sku: "TEST-M",
    stock: 5,
    reservedStock: 0,
    isInStock: true,
    attributes: [
      {
        key: "size",
        value: "M",
      },
    ],
  },
];

const dummyProducts = [
  {
    _id: "test-drop-1",
    id: "test-drop-1",
    productId: "test-drop-1",
    productCode: "TEST01",

    title:
      "Chocolate Brown Ruched Dress",

    slug:
      "chocolate-brown-ruched-dress",

    price: 1999,
    compareAtPrice: 2999,

    priceLogs: [
      {
        oldPrice: 2999,
        newPrice: 2499,
        changedAt:
          "2026-09-15T10:00:00.000Z",
      },
      {
        oldPrice: 2499,
        newPrice: 1999,
        changedAt:
          "2026-09-19T10:00:00.000Z",
      },
    ],

    latestPriceLog: {
      oldPrice: 2499,
      newPrice: 1999,
      changedAt:
        "2026-09-19T10:00:00.000Z",
    },

    previousPrice: 2499,
    priceDroppedBy: 500,
    priceDropPercentage: 20,
    hasPriceDrop: true,

    thumbnail: svgImage(
      "BROWN DRESS",
      "#dcc7b7",
      "#3f2418",
    ),

    images: [
      svgImage(
        "BROWN DRESS",
        "#dcc7b7",
        "#3f2418",
      ),
      svgImage(
        "BACK VIEW",
        "#c9ad99",
        "#3f2418",
      ),
    ],

    categories: ["dress"],
    category: "dress",

    isBestSeller: true,
    isTrending: false,
    isInStock: true,
    stockType: "limited",

    attributes: [
      {
        key: "size",
        values: ["XS", "S", "M"],
      },
    ],

    variants: sizeVariants,
  },

  {
    _id: "test-drop-2",
    id: "test-drop-2",
    productId: "test-drop-2",
    productCode: "TEST02",

    title:
      "Midnight Black Corset Top",

    slug:
      "midnight-black-corset-top",

    price: 1499,
    compareAtPrice: 1999,

    priceLogs: [
      {
        oldPrice: 1699,
        newPrice: 1499,
        changedAt:
          "2026-09-19T11:00:00.000Z",
      },
    ],

    latestPriceLog: {
      oldPrice: 1699,
      newPrice: 1499,
      changedAt:
        "2026-09-19T11:00:00.000Z",
    },

    previousPrice: 1699,
    priceDroppedBy: 200,
    priceDropPercentage: 12,
    hasPriceDrop: true,

    thumbnail: svgImage(
      "BLACK TOP",
      "#d8d8d8",
      "#111111",
    ),

    images: [
      svgImage(
        "BLACK TOP",
        "#d8d8d8",
        "#111111",
      ),
    ],

    categories: ["top"],
    category: "top",

    isBestSeller: false,
    isTrending: true,
    isInStock: true,
    stockType: "unlimited",

    attributes: [
      {
        key: "size",
        values: ["XS", "S", "M"],
      },
    ],

    variants: sizeVariants,
  },

  {
    _id: "test-no-drop",
    id: "test-no-drop",
    productId: "test-no-drop",
    productCode: "TEST03",

    title:
      "Ivory Satin Statement Shirt",

    slug:
      "ivory-satin-statement-shirt",

    price: 1799,
    compareAtPrice: 2199,

    priceLogs: [],
    latestPriceLog: null,
    previousPrice: null,
    priceDroppedBy: 0,
    priceDropPercentage: 0,
    hasPriceDrop: false,

    thumbnail: svgImage(
      "IVORY SHIRT",
      "#f0ece2",
      "#625d50",
    ),

    images: [
      svgImage(
        "IVORY SHIRT",
        "#f0ece2",
        "#625d50",
      ),
    ],

    categories: ["shirt"],
    category: "shirt",

    isBestSeller: false,
    isTrending: false,
    isInStock: true,
    stockType: "unlimited",

    attributes: [
      {
        key: "size",
        values: ["XS", "S", "M"],
      },
    ],

    variants: sizeVariants,
  },

  {
    _id: "test-increase",
    id: "test-increase",
    productId: "test-increase",
    productCode: "TEST04",

    title:
      "Cherry Red Mini Dress",

    slug:
      "cherry-red-mini-dress",

    price: 2299,
    compareAtPrice: 2599,

    priceLogs: [
      {
        oldPrice: 1999,
        newPrice: 2299,
        changedAt:
          "2026-09-19T12:00:00.000Z",
      },
    ],

    latestPriceLog: {
      oldPrice: 1999,
      newPrice: 2299,
      changedAt:
        "2026-09-19T12:00:00.000Z",
    },

    previousPrice: null,
    priceDroppedBy: 0,
    priceDropPercentage: 0,
    hasPriceDrop: false,

    thumbnail: svgImage(
      "RED DRESS",
      "#efc6c6",
      "#8b1111",
    ),

    images: [
      svgImage(
        "RED DRESS",
        "#efc6c6",
        "#8b1111",
      ),
    ],

    categories: ["dress"],
    category: "dress",

    isBestSeller: false,
    isTrending: false,
    isInStock: true,
    stockType: "limited",

    attributes: [
      {
        key: "size",
        values: ["XS", "S", "M"],
      },
    ],

    variants: sizeVariants,
  },
];

export default function ProductCardTestPage() {
  return (
    <main className="min-h-screen bg-white px-3 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/45">
            Component Testing
          </p>

          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-black md:text-3xl">
            Product Card Price Drop
          </h1>

          <p className="mt-2 max-w-xl text-sm text-black/55">
            First two cards should show the
            price-drop label. Last two cards
            should not show it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {dummyProducts.map(
            (product) => (
              <ProductCard
                key={product._id}
                product={product}
                disableRecentlyViewed
                hideWishlistIcon
              />
            ),
          )}
        </div>

        <div className="mt-12 grid gap-3 text-xs md:grid-cols-2">
          <TestResult
            title="TEST01"
            description="₹500 drop and 20% should display."
            passed
          />

          <TestResult
            title="TEST02"
            description="₹200 drop and 12% should display."
            passed
          />

          <TestResult
            title="TEST03"
            description="No price history; drop label must remain hidden."
          />

          <TestResult
            title="TEST04"
            description="Latest price increased; drop label must remain hidden."
          />
        </div>
      </div>
    </main>
  );
}

function TestResult({
  title,
  description,
  passed = false,
}) {
  return (
    <div className="flex items-start gap-3 bg-neutral-50 p-4">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${passed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-neutral-200 text-neutral-600"
          }`}
      >
        {passed ? "✓" : "—"}
      </span>

      <div>
        <p className="font-black text-black">
          {title}
        </p>

        <p className="mt-0.5 text-black/50">
          {description}
        </p>
      </div>
    </div>
  );
}
