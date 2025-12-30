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

const LOGO_URL =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png";

export default function DesktopHeader() {
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef(null);
  const fetchedOnceRef = useRef(false);

  // ✅ separate selectors (fixes Turbopack getServerSnapshot loop)
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
      dropdownRef.current && !dropdownRef.current.contains(e.target) && setOpen(false);

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

  const handleSearchSubmit = (e) => {
    if (e.key !== "Enter") return;
    const q = searchText.trim();
    router.push(`/search?query=${encodeURIComponent(q)}`);
  };

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
    className={[
      "hidden md:flex w-full bg-white z-50",
      "border-b border-black/10",
      isSticky ? "fixed top-0 left-0" : "relative",
    ].join(" ")}
  >
    <div className="w-full flex items-center justify-between px-10 py-4">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-6">

        {/* Categories */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-label="Open categories"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full p-2
                       text-black transition hover:bg-black/5"
          >
            <Menu size={24} />
          </button>

          {open && (
            <div className="absolute left-0 top-12 z-50 w-[520px] max-w-[70vw]
                            rounded-2xl border border-black/10 bg-white p-4 shadow-xl">

              {loading && (
                <p className="px-2 py-1 text-sm text-black/60">
                  Loading categories…
                </p>
              )}

              {error && (
                <p className="px-2 py-1 text-sm text-black/60">
                  {error}
                </p>
              )}

              {!loading && !error && menuCats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {menuCats.map((c) => (
                    <Link
                      key={c.key}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-lg border border-black/10 px-3 py-2
                                 text-sm text-black/70 text-center
                                 hover:bg-black/5 hover:text-black transition"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}

              {!loading && !error && !menuCats.length && (
                <p className="px-2 py-1 text-sm text-black/60">
                  No categories found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Logo */}
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

      {/* ================= SEARCH ================= */}
      <div className="w-[42%]">
        <div
          className="flex items-center rounded-full border border-black/15
                     bg-white px-4 py-2 transition
                     focus-within:border-black"
        >
          <Search size={18} className="text-black/50" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search products"
            className="w-full bg-transparent px-3 text-sm
                       text-black placeholder-black/40
                       outline-none"
          />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex items-center gap-7 text-black">
        <WishlistButton />
        <CartButton />
        <ProfileMenu />
      </div>
    </div>
  </header>
);

}
