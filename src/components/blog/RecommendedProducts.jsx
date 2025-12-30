"use client";

import ProductCard from "@/components/common/ProductCard";

/**
 * Recommended Products
 * Uses the SAME ProductCard as listings
 */
export default function RecommendedProducts({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mt-16 max-w-[1100px] mx-auto">
      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-black">
          Recommended Products
        </h2>
        <div className="h-px w-20 bg-black/30 mt-2" />
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
        {products.map((p, index) => {
          /**
           * 🔥 Normalize blog product → ProductCard format
           * ProductCard expects:
           * { id, name, price, image, images, categories }
           */
          const product = {
            id: p.id || p._id,
            name: p.name || p.title || "Product",
            price: p.price,
            image: p.image || p.thumbnail,
            images: p.images ? p.images : p.image ? [{ src: p.image }] : [],
            categories: p.category
              ? [{ slug: p.category }]
              : [{ slug: "products" }],
          };

          if (!product.id) return null;

          return (
            <div
              key={product.id ?? index}
              className="snap-start flex-shrink-0 w-[180px]"
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
