"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { useWishlistStore } from "@/store/wishlistStore";
import WishlistCard from "@/components/wishlist/WishlistCard";

const getPid = (item) =>
  String(item?._id || item?.id || item?.productId || item || "").trim();

const toNum = (value) => {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function Toast({ message }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 border border-white/10 bg-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-2xl"
    >
      {message}
    </motion.div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="border border-neutral-200 bg-white">
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="space-y-2 p-3">
            <div className="relative h-3 w-4/5 overflow-hidden bg-neutral-100">
              <div className="absolute inset-0 shimmer" />
            </div>
            <div className="relative h-3 w-2/5 overflow-hidden bg-neutral-100">
              <div className="absolute inset-0 shimmer" />
            </div>
            <div className="relative h-10 w-full overflow-hidden bg-neutral-100">
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { items, loading, fetchFromBackend, removeFromWishlist, clearWishlist } =
    useWishlistStore();
  const { addToCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const { fetchProductDetails } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [toast, setToast] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [fullProducts, setFullProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisibleCount(12);
  }, []);

  useEffect(() => {
    if (!mounted || !user?.uid) return;
    fetchFromBackend(user.uid, { force: true });
  }, [mounted, user?.uid, fetchFromBackend]);

  useEffect(() => {
    if (!mounted) return;

    if (!items?.length) {
      setFullProducts([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setProdLoading(true);
        const ids = Array.from(new Set((items || []).map(getPid).filter(Boolean)));
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              return await fetchProductDetails(id);
            } catch {
              return null;
            }
          })
        );

        if (!cancelled) setFullProducts(results.filter(Boolean));
      } finally {
        if (!cancelled) setProdLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, items, fetchProductDetails]);

  useEffect(() => {
    if (!mounted) return undefined;

    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 240) {
        setVisibleCount((count) => count + 8);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  const wishlist = mounted ? fullProducts || [] : [];

  const sorted = useMemo(() => {
    const arr = [...wishlist];
    if (sortBy === "low-high") arr.sort((a, b) => toNum(a.price) - toNum(b.price));
    if (sortBy === "high-low") arr.sort((a, b) => toNum(b.price) - toNum(a.price));
    if (sortBy === "newest") arr.reverse();
    return arr;
  }, [wishlist, sortBy]);

  const visibleItems = sorted.slice(0, visibleCount);
  const idsCount = items?.length || 0;
  const loadedCount = wishlist.length;
  const isBusy = loading || prodLoading;

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1400);
  };

  const moveToBag = (product) => {
    const id = product?._id || product?.id || product?.productId;
    addToCart(product);
    removeFromWishlist(id);
    showToast("MOVED TO BAG");
  };

  const removeItem = (id) => {
    removeFromWishlist(id);
    showToast("REMOVED FROM WISHLIST");
  };

  if (!mounted) {
    return <section className="min-h-[85vh] bg-[#f7f7f5]" />;
  }

  return (
    <section className="min-h-[85vh] bg-[#f7f7f5] px-3 py-3 text-black sm:px-5 sm:py-7 lg:px-8">
      <AnimatePresence>{toast ? <Toast message={toast} /> : null}</AnimatePresence>

      <div className="w-full space-y-3 sm:space-y-4">
        <header className="grid gap-0 border border-neutral-200 bg-white lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="bg-black p-5 text-white sm:p-8 lg:p-9">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
              <Sparkles size={14} />
              SAVED STYLE EDIT
            </p>
            <h1 className="mt-5 text-3xl font-black uppercase leading-none tracking-normal sm:text-5xl lg:text-6xl">
              YOUR WISHLIST.
            </h1>
            <p className="mt-4 max-w-2xl text-xs font-bold uppercase leading-6 tracking-[0.09em] text-white/62">
              KEEP YOUR OATCLUB PICKS CLOSE. MOVE FAST WHEN THE FIT FEELS RIGHT.
            </p>
          </div>

          <div className="grid grid-cols-3 border-t border-neutral-200 bg-white lg:border-l lg:border-t-0">
            {[
              ["SAVED", idsCount],
              ["LOADED", loadedCount],
              ["SHOWING", visibleItems.length],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-neutral-200 p-4 last:border-r-0 lg:p-5">
                <p className="text-2xl font-black leading-none text-black">{value}</p>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] text-black/42">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </header>

        <div className="flex flex-col gap-3 border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 border border-neutral-200 bg-neutral-50 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-black/55">
              <Heart size={14} className="fill-black text-black" />
              CURATED PICKS
            </span>
            {isBusy ? (
              <span className="inline-flex h-10 items-center gap-2 border border-neutral-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-black/45">
                <span className="h-2 w-2 animate-pulse bg-black" />
                SYNCING
              </span>
            ) : null}
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 min-w-0 border border-neutral-300 bg-white px-3 text-[10px] font-black uppercase tracking-[0.12em] text-black outline-none transition focus:border-black"
            >
              <option value="default">RECOMMENDED</option>
              <option value="newest">NEWEST SAVED</option>
              <option value="low-high">PRICE LOW TO HIGH</option>
              <option value="high-low">PRICE HIGH TO LOW</option>
            </select>

            {idsCount > 0 ? (
              <button
                type="button"
                onClick={clearWishlist}
                className="grid h-10 w-10 place-items-center border border-neutral-300 bg-white text-black transition hover:border-black"
                aria-label="Clear wishlist"
                title="Clear wishlist"
              >
                <Trash2 size={15} />
              </button>
            ) : null}
          </div>
        </div>

        {isBusy && !loadedCount ? (
          <WishlistSkeleton />
        ) : !isBusy && loadedCount === 0 ? (
          <div className="grid min-h-[360px] place-items-center border border-neutral-200 bg-white p-6 text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center border border-neutral-200 bg-neutral-50">
                <Heart size={28} className="text-black/35" />
              </div>
              <h2 className="mt-5 text-xl font-black uppercase tracking-[0.08em] text-black sm:text-2xl">
                WISHLIST IS EMPTY
              </h2>
              <p className="mt-3 text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/45">
                START SAVING THE PIECES YOU WANT TO COME BACK TO.
              </p>
              <Link
                href="/all-clothing"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
              >
                SHOP ALL CLOTHING <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
            >
              <AnimatePresence>
                {visibleItems.map((item) => (
                  <motion.div
                    layout
                    key={item._id || item.id || item.productId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WishlistCard
                      product={item}
                      onRemove={removeItem}
                      onMoveToBag={moveToBag}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {visibleItems.length < sorted.length ? (
              <div className="flex justify-center py-8">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-black/45">
                  <RotateCcw size={14} className="animate-spin" />
                  LOADING MORE EDITS
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
