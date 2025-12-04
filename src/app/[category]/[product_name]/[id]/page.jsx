// src/app/[category]/[id]/page.jsx
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ShoppingCart, Heart, Zap, Share2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

import ProductGallery from "@/components/productDetail/ProductGallery";
import RelatedProducts from "@/components/productDetail/relatedProducts";

import WashcareSection from "@/components/productDetail/WashcareSection";
import ProductDetailSection from "@/components/productDetail/ProductDetailSection";
import ReviewSection from "../../../../components/productDetail/ReviewSection";

import SupportSection from "@/components/productDetail/SupportSection"; // ✅ USE COMPONENT HERE

const BRAND = {
  burgundy: "#800020",
  black: "#111111",
};

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
}

/* ------------------------------ */
/* Accordion UI (same as your sample) */
/* ------------------------------ */
function Accordion({ title, children, defaultOpen = false, borderTop = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${borderTop ? "border-t border-gray-200" : ""} py-3`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-base md:text-lg font-semibold text-black">{title}</span>

        {open ? <Minus className="h-5 w-5 text-black" /> : <Plus className="h-5 w-5 text-black" />}
      </button>

      <div
        className={`transition-all overflow-hidden duration-300 ${
          open ? "max-h-[900px] mt-3" : "max-h-0"
        }`}
      >
        {open ? children : null}
      </div>
    </div>
  );
}

/* ------------------------------ */
/* Size Guide (exact UI like your sample) */
/* ------------------------------ */
function SizeGuideSection() {
  return (
    <Accordion title="Size Guide">
      <div className="text-gray-700 text-sm leading-relaxed space-y-4">
        <p className="font-medium text-black">How to Measure</p>

        <ul className="space-y-1">
          <li>
            • <strong>Bust:</strong> Measure around the fullest part of your chest.
          </li>
          <li>
            • <strong>Waist:</strong> Measure around the narrowest part of your waist.
          </li>
          <li>
            • <strong>Hips:</strong> Measure around the widest part of your hips.
          </li>
          <li>
            • <strong>Length:</strong> Measure from shoulder to hem.
          </li>
        </ul>

        <div className="pt-3">
          <p className="font-medium text-black mb-2">Size Chart (General)</p>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Size</th>
                <th className="py-2">Bust</th>
                <th className="py-2">Waist</th>
                <th className="py-2">Hips</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="py-2">XS</td>
                <td>30-32"</td>
                <td>24-26"</td>
                <td>32-34"</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">S</td>
                <td>32-34"</td>
                <td>26-28"</td>
                <td>34-36"</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">M</td>
                <td>34-36"</td>
                <td>28-30"</td>
                <td>36-38"</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">L</td>
                <td>36-38"</td>
                <td>30-32"</td>
                <td>38-40"</td>
              </tr>

              <tr>
                <td className="py-2">XL</td>
                <td>38-40"</td>
                <td>32-34"</td>
                <td>40-42"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Accordion>
  );
}

export default function ProductPage({ params }) {
  const { category, id } = use(params);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const recentlyViewedStore = useRecentlyViewedStore();

  const { addToCart } = cartStore;
  const { addToWishlist, removeFromWishlist, isInWishlist, initialize: initWishlist } = wishlistStore;

  useEffect(() => {
    cartStore.initialize?.();
    initWishlist?.();
    console.log("[ProductPage] init stores");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* FETCH PRODUCT */
  useEffect(() => {
    let mounted = true;

    async function fetchProduct() {
      setLoading(true);

      try {
        console.log("[ProductPage] fetching product", { category, id });

        const base = process.env.NEXT_PUBLIC_WC_URL;
        const key = process.env.NEXT_PUBLIC_WC_KEY;
        const secret = process.env.NEXT_PUBLIC_WC_SECRET;

        if (!base || !key || !secret) {
          console.error("[ProductPage] Missing WC env vars", {
            NEXT_PUBLIC_WC_URL: !!base,
            NEXT_PUBLIC_WC_KEY: !!key,
            NEXT_PUBLIC_WC_SECRET: !!secret,
          });
          toast.error("Store config missing (WC env vars).");
          return;
        }

        const url = `${base}/wp-json/wc/v3/products/${id}?consumer_key=${key}&consumer_secret=${secret}`;
        console.log("[ProductPage] WC URL:", url);

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          console.error("[ProductPage] WC error", { status: res.status, data });
          toast.error(data?.message || "Failed to load product");
          return;
        }

        const sizeAttr =
          data.attributes?.find((a) =>
            ["size", "pa_size"].includes(String(a.name || "").toLowerCase())
          )?.options ?? [];

        const mapped = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: Number(data.price) || 0,
          regularPrice: Number(data.regular_price) || Number(data.price) || 0,
          onSale: !!data.on_sale,
          images: data.images?.map((i) => i.src) ?? [],
          shortDescription: data.short_description || "",
          description: data.description || "",
          sizes: sizeAttr.map((s) => String(s).trim()).filter(Boolean),
          categories: data.categories ?? [],
          stockStatus: data.stock_status || "",
          permalink: data.permalink || "",
        };

        console.log("[ProductPage] mapped product:", mapped);

        if (mounted) {
          setProduct(mapped);
          if (mapped.sizes.length === 1) setSelectedSize(mapped.sizes[0]);
        }
      } catch (e) {
        console.error("[ProductPage] fetch failed", e);
        toast.error("Something went wrong while loading product.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProduct();
    return () => (mounted = false);
  }, [id, category]);

  useEffect(() => {
    if (!product) return;
    recentlyViewedStore.addProduct?.(product);
    console.log("[ProductPage] recently viewed add", product.id);
  }, [product, recentlyViewedStore]);

  const requireSize = product?.sizes?.length > 0;

  const handleAddToCart = () => {
    console.log("[ProductPage] addToCart click", { productId: product?.id, selectedSize });
    if (!product) return;
    if (requireSize && !selectedSize) return toast.error("Please select a size");

    addToCart({ ...product, selectedSize });
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    console.log("[ProductPage] buyNow click", { productId: product?.id, selectedSize });
    if (!product) return;
    if (requireSize && !selectedSize) return toast.error("Please select a size");

    addToCart({ ...product, selectedSize });
    window.location.href = "/checkout";
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    const inWL = isInWishlist?.(product.id);
    console.log("[ProductPage] wishlist toggle", { productId: product.id, inWL });

    if (inWL) {
      removeFromWishlist(product.id);
      toast("Removed from wishlist 💔");
    } else {
      addToWishlist(product);
      toast("Added to wishlist ❤️");
    }
  };

  const shareMessage = useMemo(() => {
    if (!product) return "";
    const link = (typeof window !== "undefined" && window.location.href) || product.permalink || "";
    return `✨ ${product.name}\n₹${money(product.price)}${selectedSize ? ` • Size: ${selectedSize}` : ""}\n${link}`;
  }, [product, selectedSize]);

  const handleShare = async () => {
    if (!product) return;
    const url = (typeof window !== "undefined" && window.location.href) || product.permalink || "";

    console.log("[ProductPage] share click", { productId: product.id, url, selectedSize });

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareMessage, url });
        toast("Thanks for sharing!");
      } else {
        await navigator.clipboard.writeText(shareMessage);
        toast.success("Share text copied ✅");
      }
    } catch (e) {
      console.log("[ProductPage] share cancelled/blocked", e);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>;
  if (!product) return <div className="p-10 text-center text-gray-500 text-sm">Product not found</div>;

  const wishlisted = isInWishlist?.(product.id);

  return (
    <div className="w-full px-4 md:px-12 py-6 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEFT */}
        <div className="w-full md:max-w-[420px] mx-auto">
          <ProductGallery images={product.images} />
        </div>

        {/* RIGHT */}
        <aside className="space-y-4 w-full">
          {/* Breadcrumb */}
          <div className="text-xs md:text-sm text-gray-500">
            <a href="/" className="hover:underline">
              Home
            </a>{" "}
            /{" "}
            <a href={`/${category}`} className="hover:underline capitalize">
              {category}
            </a>{" "}
            / <span className="text-gray-900">{product.name}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-black leading-tight">
            {product.name}
          </h1>

          {/* PRICE + minimal icons */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-semibold text-black">
                ₹{money(product.price)}
              </span>

              {product.regularPrice > product.price && (
                <span className="line-through text-base text-gray-500">
                  ₹{money(product.regularPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleWishlist}
                className="p-1 rounded-full hover:bg-black/5 active:scale-95 transition"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={wishlisted ? "Wishlisted" : "Add to wishlist"}
              >
                <Heart
                  size={20}
                  className={wishlisted ? "fill-current text-[#800020]" : "text-gray-900"}
                />
              </button>

              <button
                onClick={handleShare}
                className="p-1 rounded-full hover:bg-black/5 active:scale-95 transition"
                aria-label="Share"
                title="Share"
              >
                <Share2 size={20} className="text-gray-900" />
              </button>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex gap-2 flex-wrap pt-2">
            <button
              onClick={handleAddToCart}
              className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
              style={{ backgroundColor: BRAND.black }}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
              style={{ backgroundColor: BRAND.burgundy }}
            >
              <Zap size={18} />
              Buy Now
            </button>
          </div>

          {/* SIZE SELECTOR */}
          {product.sizes.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h3 className="text-xs font-medium text-black">Select Size</h3>

              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => {
                  const active = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        console.log("[ProductPage] size select:", s);
                        setSelectedSize(s);
                      }}
                      className={`px-3 py-1.5 text-sm border transition ${
                        active ? "text-white" : "text-black"
                      }`}
                      style={{
                        backgroundColor: active ? BRAND.burgundy : "#fff",
                        borderColor: active ? BRAND.burgundy : "#d1d5db",
                      }}
                    >
                      {s.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DETAILS */}
          <ProductDetailSection title="Product Details" content={product.description} />

          {/* Size guide */}
          <SizeGuideSection />

          {/* WASHCARE */}
          <WashcareSection
            title="Washcare & Instructions"
            items={[
              "Machine wash cold with like colors",
              "Do not bleach",
              "Tumble dry low or hang dry",
              "Cool iron if needed",
              "Do not dry clean",
            ]}
          />

          {/* ✅ USE SUPPORT COMPONENT FROM src/components/productDetail/SupportSection.jsx */}
          <SupportSection
            product={product}
            selectedSize={selectedSize}
            requireSize={requireSize}
            brand={BRAND}
          />

          <ReviewSection />
        </aside>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-10">
        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
}
