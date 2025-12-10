"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Search,
  Home,
  LayoutGrid,
  Heart,
  Info,
  Mail,
} from "lucide-react";
import Image from "next/image";

import WishlistButton from "@/components/header/WishlistButton";
import { useCartStore } from "@/store/cartStore";

const LOGO_URL =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png";

const money = (value, currency = "INR") => {
  const n = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
};

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  const router = useRouter();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  // ✅ IMPORTANT: use separate selectors (stable) to avoid getSnapshot loop
  const cartItems = useCartStore((s) => s.items);
  const cartInitialize = useCartStore((s) => s.initialize);
  const cartTotalCountFn = useCartStore((s) => s.totalCount);
  const cartTotalPriceFn = useCartStore((s) => s.totalPrice);

  // init cart once on mount (safe)
  useEffect(() => {
    cartInitialize?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartCount = useMemo(() => {
    try {
      return typeof cartTotalCountFn === "function" ? cartTotalCountFn() : 0;
    } catch {
      return 0;
    }
  }, [cartTotalCountFn, cartItems]);

  const cartSubtotal = useMemo(() => {
    try {
      return typeof cartTotalPriceFn === "function" ? cartTotalPriceFn() : 0;
    } catch {
      return 0;
    }
  }, [cartTotalPriceFn, cartItems]);

  // ✅ measure actual topbar height (TopbarHeadline) and store it in CSS var
  const topbarHRef = useRef(0);

  // ✅ sticky logic (becomes fixed AFTER topbar)
  useEffect(() => {
    const measureTopbar = () => {
      const el =
        document.getElementById("topbar-headline") ||
        document.querySelector("[data-topbar]") ||
        document.querySelector(".topbar-headline");

      const h = el ? Math.round(el.getBoundingClientRect().height) : 0;
      topbarHRef.current = h;
      document.documentElement.style.setProperty("--app-topbar-h", `${h}px`);
      return h;
    };

    const onScroll = () => {
      const topbarH = measureTopbar();
      setIsSticky(window.scrollY > topbarH);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ✅ Lock body scroll + ESC close when drawer is open
  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  // ✅ Keep CSS var updated with FULL header height (including search bar)
  useEffect(() => {
    const setHeaderVar = () => {
      const el = document.getElementById("mobile-header");
      if (!el) return;
      const h = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--app-header-h", `${h}px`);
    };

    setHeaderVar();

    const el = document.getElementById("mobile-header");
    if (!el) return;

    const ro = new ResizeObserver(() => setHeaderVar());
    ro.observe(el);

    window.addEventListener("resize", setHeaderVar, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setHeaderVar);
    };
  }, [showSearch]);

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(searchText)}`);
      setShowSearch(false);
      setSearchText("");
    }
  };

  const drawerVariants = {
    hidden: { x: "-100%" },
    show: { x: 0, transition: { type: "spring", stiffness: 320, damping: 34 } },
    exit: { x: "-100%", transition: { type: "spring", stiffness: 320, damping: 38 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  };

  const navItems = useMemo(
    () => [
      { name: "Home", href: "/", icon: Home },
      { name: "Categories", href: "/categories", icon: LayoutGrid },
      { name: "Wishlist", href: "/wishlist", icon: Heart },
      { name: "Cart", href: "/cart", icon: ShoppingBag },
      { name: "About", href: "/about", icon: Info },
      { name: "Contact", href: "/contact", icon: Mail },
    ],
    []
  );

  // ✅ Offsets
  const topbarH = `var(--app-topbar-h, 0px)`;
  const headerH = `var(--app-header-h, 64px)`;
  const safeTop = `env(safe-area-inset-top, 0px)`;

  const headerTop = isSticky ? `calc(${topbarH} + ${safeTop})` : "0px";
  const overlayTop = isSticky ? `calc(${topbarH} + ${headerH} + ${safeTop})` : "0px";
  const overlayHeight = isSticky ? `calc(100dvh - ${topbarH} - ${headerH} - ${safeTop})` : "100dvh";

  return (
    <header
      id="mobile-header"
      className={[
        "md:hidden w-full bg-white shadow-md border-b border-gray-300",
        "z-[9999]",
        isSticky ? "fixed left-0 right-0" : "relative",
      ].join(" ")}
      style={{ top: headerTop }}
    >
      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={openMenu}
          aria-label="Open menu"
          className="shrink-0 text-black hover:text-[#800020] transition"
        >
          <Menu size={26} />
        </button>

        <Link href="/" aria-label="Go to homepage" className="flex-1 flex items-center justify-center select-none">
          <div className="relative h-8 w-full">
            <Image
              src={LOGO_URL}
              alt="Miray"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 60vw, 240px"
            />
          </div>
        </Link>

        <div className="shrink-0 flex items-center gap-4">
          <button
            onClick={() => setShowSearch((s) => !s)}
            aria-label="Toggle search"
            className="text-black hover:text-[#800020] transition"
          >
            <Search size={22} />
          </button>

          <WishlistButton size={22} />

          {/* ✅ CART ICON + BADGE */}
          <button
            type="button"
            aria-label="Cart"
            onClick={() => router.push("/cart")}
            className="relative text-black hover:text-[#800020] transition"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 ? (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#800020] text-white text-[11px] font-semibold grid place-items-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>

          <Link href="/profile" className="text-black hover:text-[#800020] transition" aria-label="Profile">
            <User size={22} />
          </Link>
        </div>
      </div>

      {/* SEARCH BAR */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-t border-gray-300 px-4 py-2 shadow-inner"
          >
            <input
              type="text"
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed left-0 right-0 bottom-0 bg-black/45 z-[60]"
              style={{ top: overlayTop }}
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={closeMenu}
              aria-hidden="true"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
              className="fixed left-0 z-[70] bg-white flex flex-col w-[86vw] sm:w-[72vw]"
              style={{ top: overlayTop, height: overlayHeight }}
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                <span className="inline-flex items-center gap-2 text-lg font-semibold text-black">Menu</span>
                <button
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="text-black hover:text-[#800020] transition"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col text-black font-medium overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className="px-5 py-4 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-3"
                    >
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-black/5 text-black">
                        <Icon size={18} />
                      </span>
                      <span className="text-[15px]">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* CART PREVIEW */}
              <div className="border-t border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-black">Cart</div>
                  <div className="text-xs text-gray-500">
                    {cartCount} item{cartCount === 1 ? "" : "s"}
                  </div>
                </div>

                {!cartItems || cartItems.length === 0 ? (
                  <div className="mt-3 text-sm text-gray-600">Your cart is empty.</div>
                ) : (
                  <>
                    <div className="mt-3 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {cartItems.slice(0, 5).map((it) => (
                        <div
                          key={it.__key || `${it.productId}-${it.variantId || ""}`}
                          className="flex items-center gap-3"
                        >
                          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {it?.image ? (
                              <Image
                                src={it.image}
                                alt={it?.name || "Item"}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-black truncate">
                              {it?.name || "Item"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {it?.selectedSize ? `Size: ${it.selectedSize} • ` : ""}
                              Qty: {it?.quantity || 1}
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-black">
                            {money(
                              (Number(it?.price || 0) * Number(it?.quantity || 1)) || 0,
                              it?.productSnapshot?.currency || "INR"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm font-semibold text-black">Subtotal</div>
                      <div className="text-sm font-bold text-black">{money(cartSubtotal, "INR")}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        router.push("/cart");
                      }}
                      className="mt-3 w-full rounded-xl bg-[#800020] text-white font-semibold text-sm py-3 active:scale-[0.99] transition"
                    >
                      Go to Cart
                    </button>
                  </>
                )}
              </div>

              <div className="mt-auto border-t border-gray-300 px-5 py-5">
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-black hover:text-[#800020] transition"
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#800020]/10 text-[#800020]">
                    <User size={18} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">My Account</span>
                    <span className="text-xs text-gray-500">Orders • Profile • Settings</span>
                  </div>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
