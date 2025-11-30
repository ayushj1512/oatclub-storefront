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

import WashcareSection from "@/components/productDetail/WashcareSection";
import ProductDetailSection from "@/components/productDetail/ProductDetailSection";
import SizeGuideSection from "@/components/productDetail/SizeGuideSection";   // ⭐ ADDED
import ReviewSection from "../../../../components/productDetail/ReviewSection";

const BRAND = {
  burgundy: "#800020",
  black: "#111111",
};

export default function ProductPage({ params }) {
  const { category, id } = use(params);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const recentlyViewedStore = useRecentlyViewedStore();

  const { addToCart } = cartStore;
  const { addToWishlist, removeFromWishlist, isInWishlist, initialize: initWishlist } =
    wishlistStore;

  /* FETCH PRODUCT */
  useEffect(() => {
    let mounted = true;

    async function fetchProduct() {
      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_WC_URL}/wp-json/wc/v3/products/${id}?consumer_key=${process.env.NEXT_PUBLIC_WC_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_SECRET}`;
        const res = await fetch(url);
        const data = await res.json();

        const sizeAttr =
          data.attributes?.find((a) =>
            ["size", "pa_size"].includes(a.name?.toLowerCase())
          )?.options ?? [];

        const mapped = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: Number(data.price) || 0,
          regularPrice: Number(data.regular_price) || Number(data.price) || 0,
          onSale: !!data.on_sale,
          images: data.images?.map((i) => i.src) ?? [],
          shortDescription: data.short_description,
          description: data.description,
          sizes: sizeAttr.map((s) => String(s).trim()),
          categories: data.categories ?? [],
        };

        if (mounted) setProduct(mapped);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    cartStore.initialize?.();
    initWishlist?.();
  }, []);

  useEffect(() => {
    if (product) recentlyViewedStore.addProduct(product);
  }, [product]);

  /* ADD TO CART */
  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize)
      return toast.error("Please select a size");

    addToCart({ ...product, selectedSize });
    toast.success("Added to cart");
  };

  /* BUY NOW */
  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize)
      return toast.error("Please select a size");

    addToCart({ ...product, selectedSize });
    window.location.href = "/checkout";
  };

  /* WISHLIST */
  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast("Removed from wishlist 💔");
    } else {
      addToWishlist(product);
      toast("Added to wishlist ❤️");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>;

  if (!product)
    return <div className="p-10 text-center text-gray-500 text-sm">Product not found</div>;

  return (
    <>
      <div className="w-full px-4 md:px-12 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* LEFT GALLERY */}
          <div className="w-full md:max-w-[420px] mx-auto">
            <ProductGallery images={product.images} />
          </div>

          {/* RIGHT DETAILS */}
          <aside className="space-y-4 w-full">

            {/* Breadcrumb */}
            <div className="text-xs md:text-sm text-gray-500">
              <a href="/" className="hover:underline">Home</a> /
              <a href={`/${category}`} className="hover:underline capitalize ml-1">{category}</a> /
              <span className="text-gray-900 ml-1">{product.name}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-semibold text-black leading-tight">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="flex items-center gap-3">
              <span className="text-2xl md:text-3xl font-semibold text-black">
                ₹{product.price}
              </span>

              {product.regularPrice > product.price && (
                <span className="line-through text-base text-gray-500">
                  ₹{product.regularPrice}
                </span>
              )}
            </div>

            {/* SIZE SELECTOR */}
            {product.sizes.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-medium text-black">Select Size</h3>

                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => {
                    const active = selectedSize === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-sm border ${
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

           

            {/* PRODUCT DETAILS — COLLAPSIBLE */}
            <ProductDetailSection
              title="Product Details"
              content={product.description}
            /> 
            
            {/* ⭐ SIZE GUIDE SECTION ⭐ */}
            <SizeGuideSection />

            {/* WASHCARE DETAILS */}
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

<ReviewSection />
          </aside>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-10">
          <RelatedProducts productId={product.id} />
        </div>
      </div>
    </>
  );
}
