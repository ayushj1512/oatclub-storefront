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
      className={`hidden md:flex bg-white border-b border-gray-100 w-full z-50 ${
        isSticky ? "fixed top-0 left-0 shadow-sm" : "relative shadow-none"
      }`}
    >
      <div className="w-full flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-6">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label="Open categories"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-800 hover:text-[#800020]"
            >
              <Menu size={26} />
            </button>

            {open ? (
              <div className="absolute top-12 left-0 z-50 bg-white shadow-xl border border-gray-100 rounded-xl p-3 w-[520px] max-w-[70vw]">
                {loading ? (
                  <div className="px-3 py-2 text-sm text-gray-600">Loading categories…</div>
                ) : error ? (
                  <div className="px-3 py-2 text-sm text-red-600">{error}</div>
                ) : menuCats.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {menuCats.map((c) => (
                      <Link
                        key={c.key}
                        href={`/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#800020] transition text-center"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-600">No categories found.</div>
                )}
              </div>
            ) : null}
          </div>

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

        <div className="w-[42%]">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-[#800020] transition">
            <Search size={18} className="text-gray-600" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search for anything..."
              className="w-full bg-transparent outline-none px-3 text-sm text-gray-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-7 text-gray-700">
          <WishlistButton />
          <CartButton />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
