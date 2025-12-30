"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/common/ProductCard";
import { ArrowLeft } from "lucide-react";

export default function RecentlyViewedPage() {
  const { items, initialize } = useRecentlyViewedStore();

  /* Load items ONCE (from cookies) */
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <section className="w-full px-4 py-6 bg-white max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 rounded-md hover:bg-gray-100 transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Recently Viewed</h1>
      </div>

      {/* EMPTY STATE */}
   {(!items || items.length === 0) && (
  <div className="mt-20 text-center text-sm text-black/60">
    You haven't viewed any products yet.
    <div className="mt-3">
      <Link
        href="/products"
        className="font-medium text-black underline underline-offset-4 hover:opacity-70 transition"
      >
        Browse Products
      </Link>
    </div>
  </div>
)}


      {/* PRODUCT GRID */}
      {items?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              disableRecentlyViewed={true}   // ✅ IMPORTANT FIX
            />
          ))}
        </div>
      )}

    </section>
  );
}
