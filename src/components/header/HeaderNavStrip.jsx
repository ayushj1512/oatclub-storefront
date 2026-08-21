"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCategoryStore } from "@/store/categoryStore";

const STATIC_LINKS = [
  {
    label: "FESTIVE EDIT",
    href: "/festive-edit",
    slug: "festive-edit",
    highlight: true,
  },
  { label: "ALL CLOTHING", href: "/all-clothing", slug: "all-clothing" },
  { label: "NEW ARRIVALS", href: "/new-arrivals", slug: "new-arrivals" },
  { label: "BESTSELLER", href: "/bestseller", slug: "bestseller" },
];

const slugOf = (v = "") =>
  String(v)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const titleOf = (v = "") =>
  String(v).trim().replace(/[-_]+/g, " ").toUpperCase();

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
      "payday-sale",
      "featured",
      "uncategorized",
    ]);

    const dynamic = (categories || [])
      .filter((c) => !c?.parent)
      .map((c) => {
        const slug = slugOf(c?.slug || c?.name);
        return {
          label: titleOf(c?.name || slug),
          href: `/category/${slug}`,
          slug,
        };
      })
      .filter((x) => x.slug && !blocked.has(x.slug));

    return [...STATIC_LINKS, ...dynamic].filter(
      (x, i, arr) => arr.findIndex((y) => y.href === x.href) === i
    );
  }, [categories]);

  const mobile = variant === "mobile";

  return (
    <nav
      aria-label="Primary categories"
      className={
        mobile
          ? "no-scrollbar flex gap-5 overflow-x-auto border-t border-black/10 px-4 py-2.5"
          : "flex w-full items-center justify-center gap-7 border-t border-black/10 px-8 py-2.5 lg:gap-10"
      }
    >
      {links.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] transition md:text-[11px] ${item.highlight
                ? ""
                : active
                  ? "text-black"
                  : "text-black/58 hover:text-black"
              }`}
          >
            {item.highlight ? (
              <span className="bg-gradient-to-r from-[#ff4f9a] to-[#b51765] bg-clip-text text-transparent hover:opacity-75">
                {item.label}
              </span>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
