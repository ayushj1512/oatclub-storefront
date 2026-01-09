"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileMenu from "@/components/header/ProfileMenu";
import WishlistButton from "@/components/header/WishlistButton";
import CartButton from "@/components/header/CartButton";
import { useCategoryStore } from "@/store/categoryStore";
import TopbarHeadline from "@/components/layout/TopbarHeadline";

const LOGO_URL =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png";

export default function DesktopHeader() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef(null);
  const fetchedOnceRef = useRef(false);

  // ✅ separate selectors
  const categories = useCategoryStore((s) => s.categories);
  const loading = useCategoryStore((s) => s.loading);
  const error = useCategoryStore((s) => s.error);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const clearError = useCategoryStore((s) => s.clearError);

  useEffect(() => {
    const TOPBAR_HEIGHT = 36;
    const onScroll = () => setIsSticky(window.scrollY > TOPBAR_HEIGHT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onDown = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) =>
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      setOpen(false);

    window.addEventListener("keydown", onDown);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    clearError?.();
    fetchCategories({ active: true, parent: "null" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const menuCats = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list
      .map((c) => ({
        key: c?._id || c?.slug || c?.name,
        label: c?.name || c?.slug || "Category",
        slug: String(c?.slug || "").trim(),
      }))
      .filter((c) => c.slug);
  }, [categories]);

  return (
    <header
      className={`hidden md:block w-full bg-white z-50 border-b border-black/10 ${
        isSticky ? "fixed top-0 left-0" : "relative"
      }`}
    >
      <TopbarHeadline />

      {/* Main Row */}
      <div className="relative w-full flex items-center px-10 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label="Open categories"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full p-2 text-black transition hover:bg-black/5 active:scale-[0.98]"
            >
              <Menu size={24} />
            </button>

            {open && (
              <div className="absolute left-0 top-12 z-50 w-[520px] max-w-[80vw] rounded-2xl bg-white p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                {loading && (
                  <p className="px-2 py-2 text-sm text-black/60">
                    Loading categories…
                  </p>
                )}

                {error && (
                  <p className="px-2 py-2 text-sm text-black/60">{error}</p>
                )}

                {!loading && !error && menuCats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {menuCats.map((c) => (
                      <Link
                        key={c.key}
                        href={`/category/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="
                          h-10 w-full
                          rounded-xl bg-black/[0.03]
                          px-3 text-[13px] font-medium text-black/80
                          flex items-center justify-center
                          whitespace-nowrap overflow-hidden text-ellipsis
                          hover:bg-black/[0.06] hover:text-black
                          transition
                        "
                        title={c.label}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}

                {!loading && !error && !menuCats.length && (
                  <p className="px-2 py-2 text-sm text-black/60">
                    No categories found.
                  </p>
                )}
              </div>
            )}
          </div>

         
        </div>

        {/* CENTER LOGO (true center) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" aria-label="Go to homepage" className="flex items-center">
            <div className="relative h-10 w-32">
              <Image
                src={LOGO_URL}
                alt="Miray"
                fill
                priority
                className="object-contain"
                sizes="(min-width: 768px) 128px, 96px"
              />
            </div>
          </Link>
        </div>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-7 text-black">
           {/* Search Icon -> Navigate */}
        <button
  type="button"
  onClick={() => router.push("/search")}
  aria-label="Search"
  className="inline-flex items-center justify-center rounded-full p-2 text-black transition hover:bg-black/5 active:scale-[0.98]"
>
  <Search className="h-6 w-6" />
</button>

          <WishlistButton />
          <CartButton />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
