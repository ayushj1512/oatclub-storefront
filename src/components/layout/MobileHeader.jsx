"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, ShoppingBag, User, Search } from "lucide-react";

import WishlistButton from "@/components/header/WishlistButton";
import MobileSidebarDrawer from "@/components/header/MobileSidebarDrawer";
import TopbarHeadline from "@/components/layout/TopbarHeadline";
import HeaderNavStrip from "@/components/header/HeaderNavStrip";

import { useCartStore } from "@/store/cartStore";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const LOGO_URL =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

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
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const lastViewCartRef = useRef({ key: null, at: 0 });
  const cartCount = useCartStore((s) => s.totalCount());

  const handleOpenMenu = useCallback(() => setMenuOpen(true), []);
  const handleCloseMenu = useCallback(() => setMenuOpen(false), []);

  // ✅ Close drawer on route change (prevents stuck states)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ✅ Freeze-safe scroll: throttle + update only when value changes
  useEffect(() => {
    let raf = 0;
    let last = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.max(0, window.scrollY || 0);
        const next = y > 10;
        if (next !== last) {
          last = next;
          setScrolled(next);
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ✅ Header height var -> used by spacer so content doesn't jump
  useEffect(() => {
    const el = document.getElementById("mobile-header");
    if (!el) return;

    let lastH = -1;
    const setVar = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h === lastH) return;
      lastH = h;
      document.documentElement.style.setProperty("--app-header-h", `${h}px`);
    };

    setVar();
    const ro = new ResizeObserver(() => requestAnimationFrame(setVar));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ❌ IMPORTANT: Remove body scroll lock from here.
  // Drawer itself will handle lock/unlock safely (with exit animation).

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
        (sum, c) => sum + (Number(c.item_price) || 0) * (Number(c.quantity) || 1),
        0
      );

      const key = `m_viewcart_${contents.map((c) => c.id).join("_")}_${value}`;
      const now = Date.now();
      if (lastViewCartRef.current.key === key && now - lastViewCartRef.current.at < 2000) return;
      lastViewCartRef.current = { key, at: now };

      try {
        pushEcomEvent("view_cart", {
          currency: "INR",
          value,
          items: cartItems.slice(0, 50).map(ga4CartItem),
        });
      } catch {}

      await trackMeta("ViewCart", {
        currency: "INR",
        value,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        num_items: contents.reduce((s, c) => s + (c.quantity || 0), 0),
      });
    } catch {}
  }, []);

  const handleCartClick = useCallback(() => {
    fireViewCart();
    router.push("/cart");
  }, [fireViewCart, router]);

  return (
    <>
      {/* Spacer */}
      <div className="md:hidden" style={{ height: "var(--app-header-h, 56px)" }} />

      <header
        id="mobile-header"
        className={[
          "md:hidden w-full bg-white border-b border-black/10",
          "fixed top-0 left-0 right-0 z-[9999]",
          "isolate will-change-transform",
          scrolled ? "shadow-sm" : "",
        ].join(" ")}
        style={{ transform: "translateZ(0)" }}
      >
        <TopbarHeadline />

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3 justify-self-start">
            <button
              onClick={handleOpenMenu}
              aria-label="Open menu"
              className="group flex items-center text-black transition hover:text-black/55"
            >
              <Menu size={24} className="transition group-hover:rotate-90" />
            </button>

            <button
              onClick={() => router.push("/search")}
              aria-label="Search"
              className="text-black transition hover:text-black/55"
            >
              <Search size={22} />
            </button>
          </div>

          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex items-center justify-center select-none justify-self-center"
          >
            <div className="relative h-8 w-[150px]">
              <Image
                src={LOGO_URL}
                alt="OATCLUB"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 60vw, 240px"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3 justify-self-end">
            <WishlistButton size={22} />

            <button
              type="button"
              aria-label="Cart"
              onClick={handleCartClick}
              className="relative text-black transition hover:text-black/55"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center bg-black px-[4px] text-[9px] font-black text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <Link
              href="/profile"
              aria-label="Profile"
              className="text-black transition hover:text-black/55"
            >
              <User size={22} className="text-black" />
            </Link>
          </div>
        </div>

        <HeaderNavStrip variant="mobile" />
      </header>

      {/* Drawer controls body scroll lock/unlock itself */}
      <MobileSidebarDrawer open={menuOpen} onClose={handleCloseMenu} />
    </>
  );
}
