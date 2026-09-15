"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCategoryStore } from "@/store/categoryStore";

const STATIC_LINKS = [
  {
    label: "WISH OUR BOSS!!",
    isBirthday: true,
  },
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
    (state) => state.categories
  );

  const fetchCategories = useCategoryStore(
    (state) => state.fetchCategories
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
          category?.slug || category?.name
        );

        return {
          label: titleOf(category?.name || slug),
          href: `/category/${slug}`,
          slug,
        };
      })
      .filter(
        (item) =>
          item.slug && !blocked.has(item.slug)
      );

    return [...STATIC_LINKS, ...dynamic].filter(
      (item, index, items) => {
        if (item.isBirthday) {
          return (
            items.findIndex(
              (other) => other.isBirthday
            ) === index
          );
        }

        return (
          items.findIndex(
            (other) => other.href === item.href
          ) === index
        );
      }
    );
  }, [categories]);

  const mobile = variant === "mobile";

  const openBirthdayModal = () => {
    window.dispatchEvent(
      new Event("open-bday-wish-modal")
    );
  };

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
        {links.map((item, index) => {
          if (item.isBirthday) {
            return (
              <button
                key="birthday-wish"
                type="button"
                onClick={openBirthdayModal}
                className="birthday-wish-button shrink-0"
              >
                <span className="birthday-cake">
                  🎂
                </span>

                <span>{item.label}</span>

                <span className="birthday-sparkle">
                  ✨
                </span>
              </button>
            );
          }

          const active =
            pathname === item.href ||
            pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href || index}
              href={item.href}
              className={
                item.isHot
                  ? "shrink-0 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.11em] text-red-600 transition hover:text-red-700 md:text-[11px] md:tracking-[0.15em]"
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
        .birthday-wish-button {
          position: relative;
          display: inline-flex;
          height: 24px;
          align-items: center;
          justify-content: center;
          gap: 4px;
          overflow: hidden;
          white-space: nowrap;
          border: 0;
          border-radius: 3px;
          padding: 0 8px;
          color: white;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
          cursor: pointer;
          background: linear-gradient(
            90deg,
            #db2777,
            #ec4899,
            #a855f7,
            #ec4899,
            #db2777
          );
          background-size: 300% 100%;
          box-shadow: 0 2px 10px
            rgba(219, 39, 119, 0.3);
          animation:
            birthdayMove 3s linear infinite,
            birthdayPulse 2s ease-in-out infinite;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .birthday-wish-button::before {
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          content: "";
          transform: rotate(25deg);
          background: rgba(255, 255, 255, 0.35);
          animation: birthdayShine 2.8s ease-in-out
            infinite;
        }

        .birthday-wish-button:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 14px
            rgba(219, 39, 119, 0.45);
        }

        .birthday-wish-button:active {
          transform: scale(0.97);
        }

        .birthday-cake {
          font-size: 11px;
          line-height: 1;
        }

        .birthday-sparkle {
          font-size: 9px;
          line-height: 1;
          animation: sparklePop 1.3s ease-in-out
            infinite;
        }

        @media (min-width: 768px) {
          .birthday-wish-button {
            height: 30px;
            padding: 0 12px;
            font-size: 10px;
            letter-spacing: 0.14em;
          }

          .birthday-cake {
            font-size: 14px;
          }

          .birthday-sparkle {
            font-size: 11px;
          }
        }

        @keyframes birthdayMove {
          from {
            background-position: 0% 50%;
          }

          to {
            background-position: 300% 50%;
          }
        }

        @keyframes birthdayPulse {
          0%,
          100% {
            box-shadow: 0 2px 8px
              rgba(219, 39, 119, 0.28);
          }

          50% {
            box-shadow: 0 3px 15px
              rgba(219, 39, 119, 0.55);
          }
        }

        @keyframes birthdayShine {
          0% {
            left: -60%;
          }

          45%,
          100% {
            left: 140%;
          }
        }

        @keyframes sparklePop {
          0%,
          100% {
            transform: scale(0.8) rotate(-8deg);
            opacity: 0.65;
          }

          50% {
            transform: scale(1.2) rotate(8deg);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .birthday-wish-button,
          .birthday-wish-button::before,
          .birthday-sparkle {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
