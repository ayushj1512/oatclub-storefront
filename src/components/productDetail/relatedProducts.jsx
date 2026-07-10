"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { useProductStore } from "@/store/productStore";

const toString = (value) => (value == null ? "" : String(value));

const unique = (items = []) =>
  Array.from(new Set(items.filter(Boolean)));

const CARD_WIDTH =
  "w-[48vw] shrink-0 snap-start sm:w-[34vw] md:w-[25vw] lg:w-[20vw]";

export default function RelatedProducts({ currentProduct }) {
  const scrollRef = useRef(null);

  const fetchProductsByIds = useProductStore(
    (state) => state.fetchProductsByIds
  );

  const allProducts =
    useProductStore((state) => state.allProducts) || [];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawProduct = currentProduct?.raw || currentProduct || null;

  const currentProductId = toString(
    rawProduct?._id ||
      rawProduct?.id ||
      rawProduct?.productId
  );

  const relatedIds = useMemo(() => {
    const collections = Array.isArray(rawProduct?.collections)
      ? rawProduct.collections
      : [];

    const collectionProducts = Array.isArray(
      collections[0]?.products
    )
      ? collections[0].products
      : [];

    return unique(
      collectionProducts
        .map((item) =>
          toString(
            item?.product?._id ||
              item?.product?.id ||
              item?.product
          )
        )
        .filter(
          (productId) =>
            productId &&
            productId !== currentProductId
        )
    );
  }, [rawProduct, currentProductId]);

  useEffect(() => {
    let active = true;

    const loadRelatedProducts = async () => {
      try {
        setLoading(true);

        if (
          relatedIds.length &&
          typeof fetchProductsByIds === "function"
        ) {
          const response = await fetchProductsByIds(relatedIds, {
            mergeIntoAllProducts: true,
          });

          if (!active) return;

          const products = Array.isArray(response)
            ? response
            : response?.products ||
              response?.data ||
              [];

          setItems(
            products.filter(
              (product) =>
                toString(
                  product?._id ||
                    product?.id ||
                    product?.productId
                ) !== currentProductId
            )
          );

          return;
        }

        if (!active) return;

        const fallback = allProducts
          .filter(
            (product) =>
              toString(
                product?._id ||
                  product?.id ||
                  product?.productId
              ) &&
              toString(
                product?._id ||
                  product?.id ||
                  product?.productId
              ) !== currentProductId
          )
          .slice(0, 20);

        setItems(fallback);
      } catch (error) {
        console.error("RelatedProducts failed:", error);

        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRelatedProducts();

    return () => {
      active = false;
    };
  }, [
    relatedIds,
    currentProductId,
    fetchProductsByIds,
    allProducts,
  ]);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left:
        direction === "left"
          ? -container.clientWidth
          : container.clientWidth,
      behavior: "smooth",
    });
  };

  if (!loading && !items.length) return null;

  return (
    <section className="mt-10 w-full bg-white pb-8 md:mt-14 md:pb-12">
      <div className="mb-4 flex items-center justify-between px-3 md:mb-6 md:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/40">
            OATCLUB PICKS
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-black md:text-3xl">
            You’ll Love These
          </h2>
        </div>

        {!loading && (
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="grid h-10 w-10 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white"
              aria-label="Scroll related products left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="grid h-10 w-10 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white"
              aria-label="Scroll related products right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory items-start gap-px overflow-x-auto scroll-smooth pb-2"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`related-shimmer-${index}`}
                className={CARD_WIDTH}
              >
                <ProductCard loading />
              </div>
            ))
          : items.map((product, index) => (
              <div
                key={
                  product?._id ||
                  product?.id ||
                  product?.productId ||
                  product?.slug ||
                  index
                }
                className={CARD_WIDTH}
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}