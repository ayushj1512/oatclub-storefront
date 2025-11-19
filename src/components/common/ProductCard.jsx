"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

export default function ProductCard({ product }) {
  if (!product) return null;

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    initialize: initWishlist,
  } = useWishlistStore();

  const { addToCart } = useCartStore();
  const { addProduct } = useRecentlyViewedStore();

  /** INIT WISHLIST ONLY ONCE */
  useEffect(() => {
    initWishlist();
  }, [initWishlist]);

  /** TRACK RECENT VIEW */
  useEffect(() => {
    if (product?.id) addProduct(product);
  }, [product, addProduct]);

  const image = product?.images?.[0]?.src || "/placeholder.png";
  const price =
    product?.price ||
    product?.sale_price ||
    product?.regular_price ||
    "0";

  const isOnSale = Boolean(product?.on_sale);

  /** SEO-FRIENDLY ROUTE */
  const category =
    product?.categories?.[0]?.slug ||
    product?.categories?.[0]?.name ||
    "products";

  const formattedName = String(product?.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const productLink = `/${category}/${formattedName}/${product?.id}`;

  /** WISHLIST STATE */
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault(); // prevents link click
    if (isWishlisted) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  /** ADD TO CART */
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link
      href={productLink}
      className="
        relative flex flex-col bg-white 
        rounded-2xl shadow-sm border border-gray-100
        hover:shadow-md transition-all overflow-hidden
        w-[160px] sm:w-[200px] md:w-[240px]
      "
    >
      <div className="relative w-full h-[220px] bg-gray-50 p-3 rounded-t-2xl overflow-hidden">
        <Image
          src={image}
          alt={product?.name || 'Product'}
          fill
          className="object-contain transition-transform duration-500 hover:scale-105"
        />

        {/* SALE Badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-[#800020] text-white text-xs px-2 py-1 rounded shadow-sm">
            SALE
          </div>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
        >
          <Heart
            className={`w-5 h-5 transition ${
              isWishlisted
                ? "text-[#800020] fill-[#800020]"
                : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product?.name}
        </h3>

        <p className="text-lg font-semibold text-gray-900">
          ₹{price}
        </p>

        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          className="
            mt-3 flex items-center justify-center gap-2 text-sm
            bg-[#800020] text-white py-2 rounded-lg
            hover:bg-[#6a001a] transition-all shadow-sm
          "
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </Link>
  );
}
