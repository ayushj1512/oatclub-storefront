"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/productStore";
import ProductRow from "../common/ProductRow";
import HeadlineMarquee from "./HeadlineMarquee";

export default function OnFireSection() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const products = useProductStore((s) => s.filteredProducts);
  const loading = useProductStore((s) => s.isLoading);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="w-full my-10"> 
      {/* TOP MARQUEE */}
      <div className="mb-2">
        <HeadlineMarquee direction="left" speed={10}>
          ON FIRE • HOT PICKS • BESTSELLERS • MUST-HAVES •
        </HeadlineMarquee>
      </div>

      {/* PRODUCT ROW (NO TITLE) */}
      <div className="bg-white py-3">
        <ProductRow products={products} loading={loading} noTitle={true} />
      </div>

      {/* BOTTOM MARQUEE */}
      <div className="mt-2">
        <HeadlineMarquee direction="right" speed={10}>
          ON FIRE • HOT PICKS • BESTSELLERS • MUST-HAVES •
        </HeadlineMarquee>
      </div>
    </section>
  );
}
