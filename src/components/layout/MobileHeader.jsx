"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ShoppingBag, User, Search } from "lucide-react";
import Image from "next/image";

import WishlistButton from "@/components/header/WishlistButton";
import MobileSidebarDrawer from "@/components/header/MobileSidebarDrawer";
import TopbarHeadline from "@/components/layout/TopbarHeadline";

import { useCartStore } from "@/store/cartStore";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const LOGO_URL =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png";

const ga4CartItem = (it) =>
  mapItem(
    {
      _id: it?.productId || it?.id || it?._id,
      id: it?.productId || it?.id || it?._id,
      name: it?.name,
      title: it?.name,
      price: Number(it?.price ?? 0) || 0,
      category: it?.productSnapshot?.category || "",
      variant: it?.selectedSize || "",
      sku: it?.variant?.sku || it?.productSnapshot?.sku || "",
    },
    Number(it?.quantity || 1)
  );

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const router = useRouter();
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const lastViewCartRef = useRef({ key: null, at: 0 });

  const cartCount = useCartStore((s) => s.totalCount());

  const fireViewCart = useCallback(async () => {
    try {
      const cartItems = useCartStore.getState().items || [];
      if (!cartItems.length) return;

      const contents = cartItems
        .map((it) => {
          const id = it?.productId || it?.id || it?._id;
          if (!id) return null;
          return {
            id: String(id),
            quantity: Number(it?.quantity || 1),
            item_price: Number(it?.price || 0),
          };
        })
        .filter(Boolean);

      if (!contents.length) return;

      const value = contents.reduce(
        (sum, c) =>
          sum + (Number(c.item_price) || 0) * (Number(c.quantity) || 1),
        0
      );

      const key = `m_viewcart_${contents.map((c) => c.id).join("_")}_${value}`;
      const now = Date.now();
      if (
        lastViewCartRef.current.key === key &&
        now - (lastViewCartRef.current.at || 0) < 2000
      )
        return;

      lastViewCartRef.current = { key, at: now };

      // ✅ GA4 view_cart
      try {
        pushEcomEvent("view_cart", {
          currency: "INR",
          value,
          items: cartItems.slice(0, 50).map(ga4CartItem),
        });
      } catch (e) {
        console.warn("📈 GA4 view_cart failed", e);
      }

      // ✅ Meta ViewCart
      await trackMeta("ViewCart", {
        currency: "INR",
        value,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        num_items: contents.reduce((s, c) => s + (c.quantity || 0), 0),
      });
    } catch (e) {
      console.warn("🧾 ViewCart tracking failed", e);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("mobile-header");
    if (!el) return;

    const setVar = () =>
      document.documentElement.style.setProperty(
        "--app-header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`
      );

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleCartClick = useCallback(() => {
    fireViewCart();
    router.push("/cart");
  }, [fireViewCart, router]);

  return (
    <>
      <header
        id="mobile-header"
        className={[
          "md:hidden w-full bg-white border-b border-black/10 z-[9999]",
          isSticky ? "fixed top-0 left-0 right-0" : "relative",
        ].join(" ")}
      >
        <TopbarHeadline />

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={openMenu}
            aria-label="Open menu"
            className="shrink-0 text-black transition hover:opacity-70"
          >
            <Menu size={26} />
          </button>

          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex-1 flex items-center justify-center select-none"
          >
            <div className="relative h-8 w-full max-w-[160px]">
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
            {/* ✅ NO DROPDOWN: go directly to /search */}
            <button
              onClick={() => router.push("/search")}
              aria-label="Search"
              className="text-black transition hover:opacity-70"
            >
              <Search size={22} />
            </button>

            <WishlistButton size={22} />

            <button
              type="button"
              aria-label="Cart"
              onClick={handleCartClick}
              className="relative text-black transition hover:opacity-70"
            >
              <ShoppingBag size={22} />

              {cartCount > 0 && (
                <span
                  className="
                    absolute -top-2 -right-2
                    flex items-center justify-center
                    min-w-[18px] h-[18px]
                    rounded-full bg-black text-white
                    text-[10px] font-bold px-[5px]
                  "
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <Link
              href="/profile"
              aria-label="Profile"
              className="text-black transition hover:opacity-70"
            >
              <User size={22} />
            </Link>
          </div>
        </div>
      </header>

      <MobileSidebarDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
