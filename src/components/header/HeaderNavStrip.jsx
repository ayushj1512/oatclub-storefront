"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCategoryStore } from "@/store/categoryStore";

const STATIC_LINKS = [
  { label: "ALL CLOTHING", href: "/all-clothing", slug: "all-clothing" },
  { label: "NEW ARRIVALS", href: "/new-arrivals", slug: "new-arrivals" },
  { label: "BESTSELLER", href: "/bestseller", slug: "bestseller" },
];

const slugOf = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const titleOf = (value = "") =>
  String(value)
    .trim()
    .replace(/[-_]+/g, " ")
    .toUpperCase();

export default function HeaderNavStrip({ variant = "desktop" }) {
  const pathname = usePathname();
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories?.({ active: true, parent: "null" });
  }, [fetchCategories]);

  const links = useMemo(() => {
    const blocked = new Set([
      "all-clothing",
      "new-arrivals",
      "bestseller",
      "best-seller",
      "best-sellers",
      "featured",
      "uncategorized",
    ]);

    const dynamic = (Array.isArray(categories) ? categories : [])
      .filter((category) => !category?.parent)
      .map((category) => {
        const slug = slugOf(category?.slug || category?.name);
        return {
          label: titleOf(category?.name || slug),
          href: `/category/${slug}`,
          slug,
        };
      })
      .filter((item) => item.slug && !blocked.has(item.slug));

    const seen = new Set();
    return [...STATIC_LINKS, ...dynamic].filter((item) => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
  }, [categories]);

  const isMobile = variant === "mobile";

  return (
    <nav
      className={
        isMobile
          ? "no-scrollbar flex gap-5 overflow-x-auto border-t border-black/10 px-4 py-2.5"
          : "flex w-full items-center justify-center gap-7 border-t border-black/10 px-8 py-2.5 lg:gap-10"
      }
      aria-label="Primary categories"
    >
      {links.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] transition md:text-[11px] ${
              active ? "text-black" : "text-black/58 hover:text-black"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
