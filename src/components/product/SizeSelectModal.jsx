"use client";

import Image from "next/image";
import { X, Check, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";

const str = (v) => (v == null ? "" : String(v));

function toNum(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function getImage(product) {
  return (
    product?.thumbnail ||
    product?.images?.[0]?.src ||
    product?.images?.[0] ||
    product?.image ||
    ""
  );
}

function pickAttr(variant, keys = []) {
  const attrs = Array.isArray(variant?.attributes) ? variant.attributes : [];
  const keySet = keys.map((k) => str(k).trim().toLowerCase());

  const found = attrs.find((a) =>
    keySet.includes(str(a?.key).trim().toLowerCase())
  );

  return found?.value ? str(found.value) : "";
}

function getSize(variant) {
  return pickAttr(variant, ["size", "sizes", "shirt_size"]);
}

function getColor(variant) {
  return pickAttr(variant, ["color", "colour", "color_name"]);
}

function formatMoney(n) {
  return toNum(n).toLocaleString("en-IN");
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function SizeSelectModal({
  open,
  onClose,
  product,
  defaultQty = 1,
}) {
  const addToCart = useCartStore((s) => s.addToCart);

  const [selectedSize, setSelectedSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product]
  );

  const sizeOptions = useMemo(() => {
    const map = new Map();

    variants.forEach((variant) => {
      const size = getSize(variant);
      if (!size) return;

      if (!map.has(size)) {
        map.set(size, {
          size,
          variant,
          variantId: variant?._id || "",
        });
      }
    });

    const fromVariants = Array.from(map.values());

    if (fromVariants.length) return fromVariants;

    return DEFAULT_SIZES.map((size) => ({
      size,
      variant: null,
      variantId: "",
    }));
  }, [variants]);

  const selectedOption = useMemo(() => {
    return sizeOptions.find((x) => x.size === selectedSize) || null;
  }, [sizeOptions, selectedSize]);

  const selectedVariant = selectedOption?.variant || null;

  const title = product?.title || product?.name || "Product";
  const image = getImage(product);

  const price =
    selectedVariant?.price ||
    product?.price ||
    product?.sale_price ||
    product?.currentPrice ||
    0;

  const compareAt =
    selectedVariant?.compareAtPrice ||
    selectedVariant?.mrp ||
    product?.compareAtPrice ||
    product?.mrp ||
    product?.regular_price ||
    0;

  const hasDiscount = toNum(compareAt) > toNum(price);

  const handleAddToCart = async () => {
    if (!product || !selectedSize) return;

    try {
      setIsAdding(true);

      await addToCart({
        product,
        qty: defaultQty,
        variantId: selectedOption?.variantId || null,
        selectedSize,
        selectedColor: getColor(selectedVariant),
      });

      setSelectedSize("");
      onClose?.();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999]">
          <motion.button
            type="button"
            aria-label="Close size modal"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 bg-white text-black shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto md:w-[430px] md:-translate-x-1/2 md:-translate-y-1/2"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                  OATCLUB
                </p>
                <h3 className="mt-0.5 text-sm font-bold uppercase tracking-tight">
                  Select Size
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center bg-black text-white transition hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-3">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-neutral-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-[14px] font-semibold leading-snug">
                    {title}
                  </h4>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[15px] font-bold">
                      ₹{formatMoney(price)}
                    </span>

                    {hasDiscount && (
                      <span className="text-xs text-black/45 line-through">
                        ₹{formatMoney(compareAt)}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
                    Choose your fit
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {sizeOptions.map((option) => {
                  const active = selectedSize === option.size;

                  return (
                    <button
                      key={option.size}
                      type="button"
                      onClick={() => setSelectedSize(option.size)}
                      className={[
                        "relative h-12 border text-sm font-bold uppercase transition active:scale-[0.98]",
                        active
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black hover:border-black",
                      ].join(" ")}
                    >
                      {option.size}

                      {active && (
                        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center bg-black text-white ring-2 ring-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!selectedSize || isAdding}
                onClick={handleAddToCart}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-black text-[12px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-black/40"
              >
                <ShoppingBag className="h-4 w-4" />
                {isAdding ? "Adding..." : "Add To Cart"}
              </button>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}