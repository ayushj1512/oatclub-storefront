"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, UserRound, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ProfileMenu from "@/components/header/ProfileMenu";
import WishlistButton from "@/components/header/WishlistButton";
import CartButton from "@/components/header/CartButton";
import HeaderSearchBar from "@/components/header/HeaderSearchBar";
import TopbarHeadline from "@/components/layout/TopbarHeadline";
import HeaderNavStrip from "@/components/header/HeaderNavStrip";

import { useCategoryStore } from "@/store/categoryStore";
import { useCollectionStore } from "@/store/collectionStore";

const LOGO_URL =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

const toSentence = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());

export default function DesktopHeader() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const dropdownRef = useRef(null);
  const fetchedOnceRef = useRef(false);

  const categories = useCategoryStore((s) => s.categories);
  const catLoading = useCategoryStore((s) => s.loading);
  const catError = useCategoryStore((s) => s.error);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const clearCatError = useCategoryStore((s) => s.clearError);

  const collections = useCollectionStore((s) => s.items);
  const colLoading = useCollectionStore((s) => s.loading);
  const colError = useCollectionStore((s) => s.error);
  const fetchCollections = useCollectionStore((s) => s.fetchAll);
  const clearColError = useCollectionStore((s) => s.clearError);

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

    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open || fetchedOnceRef.current) return;

    fetchedOnceRef.current = true;
    clearCatError?.();
    clearColError?.();
    fetchCategories?.({ active: true, parent: "null" });
    fetchCollections?.({ force: true });
  }, [open, clearCatError, clearColError, fetchCategories, fetchCollections]);

  const cats = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];

    return list
      .map((c) => ({
        key: c?._id || c?.slug || c?.name,
        label: toSentence(c?.name || c?.slug || "Category"),
        slug: String(c?.slug || "").trim(),
      }))
      .filter((x) => x.slug);
  }, [categories]);

  const cols = useMemo(() => {
    const list = Array.isArray(collections) ? collections : [];

    return list
      .filter((c) => c?.isActive !== false)
      .map((c) => ({
        key: c?._id || c?.slug || c?.name,
        label: toSentence(c?.name || c?.slug || "Collection"),
        slug: String(c?.slug || "").trim(),
      }))
      .filter((x) => x.slug);
  }, [collections]);

  return (
    <header
      className={`hidden w-full border-b border-black/[0.06] bg-white/95 text-black backdrop-blur-xl md:block ${isSticky
          ? "fixed left-0 top-0 z-50 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.22)]"
          : "relative z-50"
        }`}
    >
      <TopbarHeadline />

      <div className="relative flex w-full items-center px-4 py-3 md:px-5 lg:px-10 lg:py-4">
        {/* LEFT MENU */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="group flex h-10 items-center gap-2 text-black transition duration-200 hover:text-black/55 active:scale-[0.98] lg:h-11"
            >
              <Menu className="h-[18px] w-[18px] transition duration-200 group-hover:rotate-90" />
              <span className="hidden text-[10px] font-black uppercase tracking-[0.16em] lg:inline">
                MENU
              </span>
            </button>

            {open && (
              <div className="absolute left-0 top-12 z-50 w-[640px] max-w-[86vw] bg-white p-5 shadow-[0_24px_80px_-38px_rgba(0,0,0,0.28)] lg:top-14">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/45">
                      OATCLUB MENU
                    </p>
                    <p className="mt-1 text-[18px] font-black uppercase leading-tight text-black">
                      EXPLORE THE EDIT
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-[10px] font-black uppercase tracking-[0.18em] text-black/45 transition hover:text-black"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="mt-5">
                  <p className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-black/35">
                    Collections
                  </p>

                  {colLoading && (
                    <p className="px-1 py-3 text-sm text-black/55">
                      Loading collections…
                    </p>
                  )}

                  {colError && (
                    <p className="px-1 py-3 text-sm text-black/55">
                      {colError}
                    </p>
                  )}

                  {!colLoading && !colError && cols.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
                      {cols.map((x, index) => (
                        <Link
                          key={x.key}
                          href={`/collection/${x.slug}`}
                          onClick={() => setOpen(false)}
                          title={x.label}
                          className={`flex h-10 items-center border-b px-0 text-left text-[11px] font-black uppercase tracking-[0.12em] transition ${index === 0
                              ? "border-black text-black"
                              : "border-black/10 text-black/65 hover:border-black hover:text-black"
                            }`}
                        >
                          <span className="truncate">{x.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!colLoading && !colError && !cols.length && (
                    <p className="px-1 py-3 text-sm text-black/55">
                      No collections found.
                    </p>
                  )}
                </div>

                <div className="my-5 h-px w-full bg-black/10" />

                <div>
                  <p className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-black/35">
                    Categories
                  </p>

                  {catLoading && (
                    <p className="px-1 py-3 text-sm text-black/55">
                      Loading categories…
                    </p>
                  )}

                  {catError && (
                    <p className="px-1 py-3 text-sm text-black/55">
                      {catError}
                    </p>
                  )}

                  {!catLoading && !catError && cats.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
                      {cats.map((x) => (
                        <Link
                          key={x.key}
                          href={`/category/${x.slug}`}
                          onClick={() => setOpen(false)}
                          title={x.label}
                          className="flex h-10 items-center border-b border-black/10 px-0 text-left text-[11px] font-black uppercase tracking-[0.12em] text-black/65 transition hover:border-black hover:text-black"
                        >
                          <span className="truncate">{x.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!catLoading && !catError && !cats.length && (
                    <p className="px-1 py-3 text-sm text-black/55">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER LOGO */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="pointer-events-auto flex items-center justify-center"
          >
            <div className="relative h-10 w-28 lg:h-12 lg:w-40">
              <Image
                src={LOGO_URL}
                alt="Oatclub"
                fill
                priority
                className="object-contain"
                sizes="(min-width:1024px) 160px, 112px"
              />
            </div>
          </Link>
        </div>

        {/* RIGHT SEARCH + ICONS */}
        {/* RIGHT SEARCH + ICONS */}
        <div className="ml-auto flex flex-1 items-center justify-end gap-2 lg:gap-3">
          {/* iPad / Medium Screen Search */}
          <Link
            href="/search"
            aria-label="Search products"
            className="flex h-11 w-8 items-center justify-center text-black transition duration-200 hover:text-black/55 lg:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Desktop Search */}
          <HeaderSearchBar className="hidden lg:block lg:w-[360px]" />

          <div className="flex h-11 w-8 items-center justify-center text-black transition duration-200 hover:text-black/55">
            <WishlistButton />
          </div>

          <div className="flex h-11 w-8 items-center justify-center text-black transition duration-200 hover:text-black/55">
            <CartButton />
          </div>

          <div className="flex h-11 items-center justify-center px-1 text-black transition duration-200 hover:text-black/55 active:scale-[0.98]">
            <ProfileMenu fallbackIcon={<UserRound className="h-5 w-5" />} />
          </div>
        </div>
      </div>

      <HeaderNavStrip />
    </header>
  );
}