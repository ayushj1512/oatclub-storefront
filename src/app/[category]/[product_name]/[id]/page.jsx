"use client";

import { use, useEffect, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

import ProductGallery from "@/components/productDetail/ProductGallery";
import RelatedProducts from "@/components/productDetail/relatedProducts";
import ShareButton from "@/components/productDetail/shareButton";
import { generateSEO } from "@/utils/seoConfig";

const BRAND = {
  burgundy: "#800020",
  burgundyDark: "#6a001a",
  black: "#111111",
  lightBg: "#faf7f8",
};

export default function ProductPage({ params }) {
  // Next.js 16: unwrap params (use(params))
  const { category, product_name, id } = use(params);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Stores (call hooks INSIDE component)
  // ------------------------------
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const recentlyViewedStore = useRecentlyViewedStore();

  // destructure store helpers (guard with optional chaining where needed)
  const { addToCart } = cartStore;
  const { addToWishlist, removeFromWishlist, isInWishlist, initialize: initWishlist } = wishlistStore;
  const { addProduct: addRecentlyViewed } = recentlyViewedStore;

  // ------------------------------
  // Fetch product from WooCommerce and map fields
  // ------------------------------
  useEffect(() => {
    let mounted = true;
    async function fetchProduct() {
      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_WC_URL}/wp-json/wc/v3/products/${id}?consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`;
        const res = await fetch(url);
        const data = await res.json();

        // safe size extraction - supports "Size", "size", "pa_size"
        const sizeAttr =
          data.attributes?.find(
            (a) =>
              typeof a.name === "string" &&
              (a.name.toLowerCase() === "size" || a.name.toLowerCase() === "pa_size")
          )?.options ?? [];

        const mapped = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: Number(data.price) || 0,
          regularPrice: Number(data.regular_price) || Number(data.price) || 0,
          salePrice: data.sale_price ? Number(data.sale_price) : null,
          onSale: !!data.on_sale,
          description: data.description || "",
          shortDescription: data.short_description || "",
          categories: data.categories ?? [],
          images: data.images?.map((img) => img.src) ?? ["/placeholder.png"],
          sizes: sizeAttr.map((s) => String(s).trim()),
          raw: data,
        };

        if (mounted) setProduct(mapped);
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ------------------------------
  // Init stores (client-only)
  // ------------------------------
  useEffect(() => {
    try {
      // cart store initializer (if implemented)
      cartStore.initialize?.();
      console.log("🟢 Cart store initialized");
    } catch (e) {
      console.warn("Cart init error:", e);
    }

    try {
      initWishlist?.();
      console.log("🟢 Wishlist store initialized");
    } catch (e) {
      console.warn("Wishlist init error:", e);
    }
  }, [cartStore, initWishlist]);

  // ------------------------------
  // Add to recently viewed
  // ------------------------------
  useEffect(() => {
    if (!product) return;
    try {
      recentlyViewedStore.addProduct?.(product);
      console.log("👁 Added to recently viewed:", product.id);
    } catch (e) {
      console.warn("Recently viewed error:", e);
    }
  }, [product, recentlyViewedStore]);

  // ------------------------------
  // SEO structured data
  // ------------------------------
  const seo = generateSEO
    ? generateSEO({
        product: {
          name: product?.name,
          description: product?.shortDescription || product?.description,
          image: product ? product.images?.[0] : undefined,
          price: product?.price,
          id: product?.id,
        },
      })
    : null;

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleAddToCart = () => {
    if (!product) {
      console.log("No product to add");
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    console.log("Adding to cart:", product.id, "size:", selectedSize);
    addToCart?.({ ...product, selectedSize });
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    console.log("Buy now:", product.id, "size:", selectedSize);
    addToCart?.({ ...product, selectedSize });
    window.location.href = "/checkout";
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    try {
      if (isInWishlist?.(product.id)) {
        removeFromWishlist?.(product.id);
        toast("Removed from wishlist 💔");
        console.log("Removed from wishlist:", product.id);
      } else {
        addToWishlist?.(product);
        toast("Added to wishlist 💖");
        console.log("Added to wishlist:", product.id);
      }
    } catch (e) {
      console.warn("Wishlist toggle error:", e);
    }
  };

  // ------------------------------
  // Loading / empty states
  // ------------------------------
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-100 rounded-2xl" />
          <div className="h-6 w-3/5 bg-gray-100 rounded" />
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-600">
        Product not found
      </div>
    );
  }

  const structuredData = seo?.structuredData ?? null;

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <>
      {structuredData && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

    <div className="w-full px-8 py-12 flex flex-col">

  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
    {/* LEFT - GALLERY */}
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 w-full">
      <div className="w-full rounded-xl overflow-hidden">
        <ProductGallery images={product.images} />
      </div>
    </div>

    {/* RIGHT - DETAILS */}
    <aside className="space-y-6 w-full">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500">
        <a href="/" className="hover:underline">Home</a> /
        <a
          href={`/${category || (product.categories[0] && product.categories[0].slug) || "products"}`}
          className="hover:underline capitalize"
        >
          {category || (product.categories[0] && product.categories[0].name) || "Products"}
        </a> /
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-[#111]">{product.name}</h1>

          <div className="flex items-center gap-4 mt-3">
            <div className="text-3xl font-bold text-[#111]">₹{product.price}</div>

            {product.regularPrice > product.price && (
              <div className="text-gray-500 line-through">₹{product.regularPrice}</div>
            )}

            {product.onSale && (
              <div className="px-3 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: BRAND.burgundy }}>
                SALE
              </div>
            )}
          </div>

          {product.shortDescription && (
            <div
              className="mt-4 text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}
        </div>

        {/* Wishlist + Share */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleToggleWishlist}
            aria-label="Add to wishlist"
            className="p-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md"
          >
            <Heart size={20}
              className={isInWishlist?.(product.id)
                ? "text-[#800020] fill-[#800020]"
                : "text-gray-600"}
            />
          </button>

          <ShareButton product={product} />
        </div>
      </div>

      {/* SIZE SELECTOR */}
      {product.sizes?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#111] mb-2">Select Size</h3>

          <div className="flex gap-3 flex-wrap">
            {product.sizes.map((s) => {
              const label = String(s).toUpperCase();
              const active = selectedSize === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 rounded-lg border text-sm transition ${active ? "text-white" : ""}`}
                  style={{
                    backgroundColor: active ? BRAND.burgundy : undefined,
                    borderColor: active ? BRAND.burgundy : "#e5e7eb",
                    color: active ? "#fff" : "#111827",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-3 mt-4 w-full">
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-sm active:scale-95 transition-transform"
          style={{ backgroundColor: BRAND.black }}
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-sm active:scale-95 transition-transform"
          style={{ backgroundColor: BRAND.burgundy }}
        >
          Buy Now
        </button>
      </div>

      {/* FULL DESCRIPTION */}
      <div className="pt-6 w-full">
        <h3 className="text-lg font-semibold text-[#111] mb-2">Product Details</h3>
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>
    </aside>
  </div>

  {/* RELATED PRODUCTS */}
  <div className="mt-16 w-full">
    <RelatedProducts productId={product.id} />
  </div>

  {/* MOBILE STICKY BAR */}
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex md:hidden gap-3 z-40">
    <button
      onClick={handleAddToCart}
      className="flex-1 text-white py-3 rounded-lg font-medium"
      style={{ backgroundColor: BRAND.black }}
    >
      Add to Cart
    </button>

    <button
      onClick={handleBuyNow}
      className="flex-1 text-white py-3 rounded-lg font-medium"
      style={{ backgroundColor: BRAND.burgundy }}
    >
      Buy Now
    </button>
  </div>

</div>

    </>
  );
}
