"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCategoryStore } from "@/store/categoryStore";

const STATIC_LINKS = [
  {
    label: "HOTSELLER",
    href: "/hotseller",
    isHot: true,
  },
  {
    label: "ALL CLOTHING",
    href: "/all-clothing",
  },
  {
    label: "NEW ARRIVALS",
    href: "/new-arrivals",
  },
  {
    label: "BESTSELLER",
    href: "/bestseller",
  },
];

const slugOf = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const titleOf = (value = "") =>
  String(value)
    .trim()
    .replace(/[-_]+/g, " ")
    .toUpperCase();

export default function HeaderNavStrip({
  variant = "desktop",
}) {
  const pathname = usePathname();

  const categories = useCategoryStore(
    (state) => state.categories,
  );

  const fetchCategories = useCategoryStore(
    (state) => state.fetchCategories,
  );

  useEffect(() => {
    fetchCategories?.({
      active: true,
      parent: "null",
    });
  }, [fetchCategories]);

  const links = useMemo(() => {
    const blocked = new Set([
      "hotseller",
      "hot-seller",
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
      .filter((category) => !category?.parent)
      .map((category) => {
        const slug = slugOf(
          category?.slug || category?.name,
        );

        return {
          label: titleOf(category?.name || slug),
          href: `/category/${slug}`,
          slug,
        };
      })
      .filter(
        (item) =>
          item.slug && !blocked.has(item.slug),
      );

    return [...STATIC_LINKS, ...dynamic].filter(
      (item, index, items) =>
        items.findIndex(
          (other) => other.href === item.href,
        ) === index,
    );
  }, [categories]);

  const mobile = variant === "mobile";

  return (
    <>
      <nav
        aria-label="Primary categories"
        className={
          mobile
            ? "no-scrollbar flex w-full items-center gap-3 overflow-x-auto border-t border-black/10 px-2 py-1.5"
            : "flex w-full items-center justify-center gap-7 border-t border-black/10 px-8 py-2 lg:gap-10"
        }
      >
        {links.map((item) => {
          const active =
            pathname === item.href ||
            pathname?.startsWith(
              `${item.href}/`,
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.isHot
                  ? "hotseller-button shrink-0"
                  : `shrink-0 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.11em] transition md:text-[11px] md:tracking-[0.15em] ${active
                    ? "text-black"
                    : "text-black/55 hover:text-black"
                  }`
              }
            >
              {item.label}

              {item.isHot && (
                <span className="ml-1">🔥</span>
              )}
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        .hotseller-button {
          display: inline-flex;
          height: 24px;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          border-radius: 3px;
          padding: 0 8px;
          color: white;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
          background: linear-gradient(
            90deg,
            #991b1b,
            #ef4444,
            #f97316,
            #facc15,
            #ef4444,
            #991b1b
          );
          background-size: 300% 100%;
          box-shadow: 0 2px 8px
            rgba(239, 68, 68, 0.3);
          animation: fireMove 2.5s linear infinite;
        }

        .hotseller-button:hover {
          box-shadow: 0 3px 12px
            rgba(239, 68, 68, 0.5);
        }

        @media (min-width: 768px) {
          .hotseller-button {
            height: 30px;
            padding: 0 12px;
            font-size: 10px;
            letter-spacing: 0.16em;
          }
        }

        @keyframes fireMove {
          from {
            background-position: 0% 50%;
          }

          to {
            background-position: 300% 50%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hotseller-button {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
