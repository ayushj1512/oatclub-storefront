"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileMenu from "@/components/header/ProfileMenu";
import WishlistButton from "@/components/header/WishlistButton";
import CartButton from "@/components/header/CartButton";
import TopbarHeadline from "@/components/layout/TopbarHeadline";

import { useCategoryStore } from "@/store/categoryStore";
import { useCollectionStore } from "@/store/collectionStore";

const LOGO_URL =
  "https://res.cloudinary.com/djtva6hec/image/upload/v1764916639/miray/media/k0yvgu5m0ij1husm3ugh.png";

const toSentence = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());

export default function DesktopHeader() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef(null);
  const fetchedOnceRef = useRef(false);

  // ✅ categories
  const categories = useCategoryStore((s) => s.categories);
  const catLoading = useCategoryStore((s) => s.loading);
  const catError = useCategoryStore((s) => s.error);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const clearCatError = useCategoryStore((s) => s.clearError);

  // ✅ collections
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

    clearCatError?.();
    clearColError?.();
    fetchCategories?.({ active: true, parent: "null" });
    fetchCollections?.({ force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      className={`hidden md:block w-full bg-white z-50 border-b border-black/10 ${
        isSticky ? "fixed top-0 left-0" : "relative"
      }`}
    >
      <TopbarHeadline />

      <div className="relative w-full flex items-center px-10 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full p-2 text-black transition hover:bg-black/5 active:scale-[0.98]"
            >
              <Menu size={24} />
            </button>

            {open && (
              <div className="absolute left-0 top-12 z-50 w-[600px] max-w-[85vw] rounded-2xl bg-white p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                {/* ✅ Collections first (black heading) */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-[13px] font-semibold text-black">
                    Collections
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-[12px] text-black/60 hover:text-black"
                  >
                    Close
                  </button>
                </div>

                {colLoading && (
                  <p className="px-1 py-2 text-sm text-black/60">
                    Loading collections…
                  </p>
                )}
                {colError && (
                  <p className="px-1 py-2 text-sm text-black/60">{colError}</p>
                )}
                {!colLoading && !colError && cols.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {cols.map((x) => (
                      <Link
                        key={x.key}
                        href={`/collection/${x.slug}`}
                        onClick={() => setOpen(false)}
                        className="h-10 w-full rounded-xl bg-black text-white px-3 text-[13px] font-medium flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis hover:opacity-90 transition"
                        title={x.label}
                      >
                        {x.label}
                      </Link>
                    ))}
                  </div>
                )}
                {!colLoading && !colError && !cols.length && (
                  <p className="px-1 py-2 text-sm text-black/60">
                    No collections found.
                  </p>
                )}

                {/* divider */}
                <div className="my-3 h-px w-full bg-black/10" />

                {/* ✅ Categories */}
                <p className="px-1 text-[13px] font-semibold text-black">
                  Categories
                </p>

                {catLoading && (
                  <p className="px-1 py-2 text-sm text-black/60">
                    Loading categories…
                  </p>
                )}
                {catError && (
                  <p className="px-1 py-2 text-sm text-black/60">{catError}</p>
                )}

                {!catLoading && !catError && cats.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {cats.map((x) => (
                      <Link
                        key={x.key}
                        href={`/category/${x.slug}`}
                        onClick={() => setOpen(false)}
                        className="h-10 w-full rounded-xl bg-black/[0.03] px-3 text-[13px] font-medium text-black/80 flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis hover:bg-black/[0.06] hover:text-black transition"
                        title={x.label}
                      >
                        {x.label}
                      </Link>
                    ))}
                  </div>
                )}

                {!catLoading && !catError && !cats.length && (
                  <p className="px-1 py-2 text-sm text-black/60">
                    No categories found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER LOGO */}
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
