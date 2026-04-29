"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductStore } from "@/store/productStore";

const SLUG = "budget-bees";
const EMPTY = [];

const money = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function MiniBudgetBeeCard({ product }) {
  const title = product?.name || product?.title || "Product";
  const image =
    product?.image || product?.thumbnail || product?.images?.[0] || "/placeholder.png";

  const price = Number(product?.price || 0);
  const mrp = Number(product?.compareAtPrice || 0);
  const showMrp = mrp > price;

  const href =
    product?.productLink ||
    `/category/${product?.categorySlug || "products"}/${product?.slug}/${product?.productCode}`;

  return (
    <Link
      href={href}
      className="block min-w-[132px] max-w-[132px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-[150px] sm:max-w-[150px]"
    >
      <div className="relative aspect-[3/4] w-full bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="150px"
        />

        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-900 shadow-sm">
          50% OFF
        </div>
      </div>

      <div className="p-2">
        <p className="line-clamp-1 text-[11px] font-medium leading-4 text-gray-900">
          {title}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-950">
            ₹{money(price)}
          </span>

          {showMrp && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{money(mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BudgetBeesCartSection() {
  const ref = useRef(null);

  const productsByCollection = useProductStore((s) => s.productsByCollection);
  const loadingMap = useProductStore((s) => s.collectionLoadingBySlug);
  const fetchProductsByCollection = useProductStore(
    (s) => s.fetchProductsByCollection
  );

  const products = productsByCollection?.[SLUG] || EMPTY;
  const loading = Boolean(loadingMap?.[SLUG]);

  useEffect(() => {
    if (!products.length && !loading) {
      fetchProductsByCollection?.(SLUG, {
        page: 1,
        limit: 100,
        isActive: true,
        isDraft: false,
      });
    }
  }, [fetchProductsByCollection, products.length, loading]);

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (!loading && !products.length) return null;

  return (
    <section className="mb-4 rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-black/5 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Budget Bees 🐝</p>
          <h2 className="text-sm font-semibold text-gray-950">
            Buy any product & get these at 50% off
          </h2>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="grid size-8 place-items-center rounded-full bg-gray-100 text-gray-900"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="grid size-8 place-items-center rounded-full bg-gray-950 text-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading && !products.length
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[218px] min-w-[132px] rounded-2xl bg-gray-100 sm:min-w-[150px]"
              />
            ))
          : products.map((product) => (
              <MiniBudgetBeeCard
                key={product.id || product._id || product.productCode}
                product={product}
              />
            ))}
      </div>
    </section>
  );
}