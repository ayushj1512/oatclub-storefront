"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { generateSEO } from "@/utils/seoConfig";

import ProductGallery from "@/components/productDetail/ProductGallery";
import PincodeCheck from "@/components/productDetail/PincodeCheck";
import RelatedProducts from "@/components/productDetail/relatedProducts";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [selectedSize, setSelectedSize] = useState(null);

  const { addToCart } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { addViewedProduct } = useRecentlyViewedStore();

  // MOCK PRODUCT (replace later)
  const product = {
    id,
    name: "Elegant Festive Saree",
    price: 2499,
    originalPrice: 2999,
    description:
      "A luxurious handcrafted saree made with soft silk and traditional zari work. Perfect for festive occasions.",
    images: [
      "/products/saree.jpg",
      "/products/saree2.jpg",
      "/products/saree3.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    tag: "Bestseller",
  };

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  useEffect(() => {
    addViewedProduct(product);
  }, [product]);

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast("Removed from Wishlist 💔");
    } else {
      addToWishlist(product);
      toast("Added to Wishlist 💖");
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    addToCart({ ...product, selectedSize });
    toast.success("Added to cart");
  };

  const handleShare = async () => {
    const shareMessage = `✨ Check out this gorgeous ${product.name}!  
${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareMessage,
          url: window.location.href,
        });
        toast("Thanks for sharing!");
      } catch {}
    } else {
      navigator.clipboard.writeText(shareMessage);
      toast("Link copied!");
    }
  };

  const { structuredData } = generateSEO({
    product: {
      name: product.name,
      description: product.description,
      image: `https://oatclub.in${product.images[0]}`,
      price: product.price,
      id: product.id,
    },
  });

  return (
    <>
      {structuredData && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* PRODUCT SECTION */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LEFT COLUMN - PRODUCT GALLERY */}
          <div className="w-full">
            <ProductGallery images={product.images} />
          </div>

          {/* RIGHT COLUMN - INFO */}
          <div className="flex flex-col gap-6">

            {product.tag && (
              <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit tracking-wide">
                {product.tag}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="flex items-center gap-4">
              <p className="text-3xl font-semibold text-pink-600">
                ₹{product.price.toLocaleString()}
              </p>

              {product.originalPrice && (
                <p className="text-gray-400 line-through text-lg">
                  ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
              {product.description}
            </p>

            {/* SIZES */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-800">
                Select Size
              </h3>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                    ${
                      selectedSize === size
                        ? "bg-pink-600 border-pink-600 text-white shadow"
                        : "border-gray-300 hover:bg-pink-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* PINCODE CHECK */}
            <PincodeCheck />

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">

              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-medium bg-pink-600 hover:bg-pink-700 transition shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={handleWishlist}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-pink-600 text-pink-600 hover:bg-pink-50 transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? "fill-pink-600 text-pink-600" : ""
                  }`}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-10 md:py-16 bg-white">
        <RelatedProducts currentProductId={product.id} />
      </div>
    </>
  );
}

