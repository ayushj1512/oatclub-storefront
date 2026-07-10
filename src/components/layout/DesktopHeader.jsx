"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import ProfileMenu from "@/components/header/ProfileMenu";
import WishlistButton from "@/components/header/WishlistButton";
import CartButton from "@/components/header/CartButton";
import HeaderSearchBar from "@/components/header/HeaderSearchBar";
import DesktopSidebarDrawer from "@/components/header/DesktopSidebarDrawer";
import TopbarHeadline from "@/components/layout/TopbarHeadline";
import HeaderNavStrip from "@/components/header/HeaderNavStrip";

const LOGO_URL =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1781123545/bd7ip3bphemzjoul4ixp.webp";

export default function DesktopHeader() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const handleOpenMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const topbarHeight = 36;

    let animationFrame = 0;
    let previousValue = null;

    const handleScroll = () => {
      if (animationFrame) return;

      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;

        const nextValue =
          Math.max(0, window.scrollY || 0) > topbarHeight;

        if (nextValue !== previousValue) {
          previousValue = nextValue;
          setIsSticky(nextValue);
        }
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {isSticky ? (
        <div className="hidden md:block">
          <div className="h-[137px] lg:h-[157px]" />
        </div>
      ) : null}

      <header
        className={[
          "hidden w-full border-b border-black/[0.06] bg-white/95 text-black backdrop-blur-xl md:block",
          isSticky
            ? "fixed inset-x-0 top-0 z-[9997] shadow-[0_10px_40px_-30px_rgba(0,0,0,0.22)]"
            : "relative z-50",
        ].join(" ")}
      >
        <TopbarHeadline />

        <div className="relative flex min-h-[76px] w-full items-center px-4 py-3 md:px-5 lg:min-h-[88px] lg:px-8 lg:py-4 xl:px-10">
          {/* Left menu */}
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={handleOpenMenu}
              className="group flex h-10 shrink-0 items-center gap-2 text-black transition duration-200 hover:text-black/55 active:scale-[0.98] lg:h-11"
            >
              <Menu className="h-[19px] w-[19px] transition duration-200 group-hover:rotate-90" />

              <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] xl:inline">
                Menu
              </span>
            </button>
          </div>

          {/* Center logo */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/"
              aria-label="Go to homepage"
              className="pointer-events-auto flex items-center justify-center"
            >
              <div className="relative h-12 w-36 md:h-14 md:w-40 lg:h-14 lg:w-44 xl:h-16 xl:w-56">
                <Image
                  src={LOGO_URL}
                  alt="OATCLUB"
                  fill
                  priority
                  className="object-contain"
                  sizes="(min-width: 1280px) 224px, (min-width: 1024px) 176px, 160px"
                />
              </div>
            </Link>
          </div>

          {/* Right controls */}
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 lg:gap-2 xl:gap-3">
            {/* Search icon for tablet and smaller desktop widths */}
            <Link
              href="/search"
              aria-label="Search products"
              className="flex h-11 w-8 shrink-0 items-center justify-center text-black transition duration-200 hover:text-black/55 xl:hidden"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Flexible search bar for wide desktop only */}
            <div className="hidden min-w-0 flex-1 justify-end xl:flex">
              <HeaderSearchBar className="w-full min-w-[220px] max-w-[420px] 2xl:max-w-[500px]" />
            </div>

            <div className="flex h-11 w-8 shrink-0 items-center justify-center text-black transition duration-200 hover:text-black/55">
              <WishlistButton />
            </div>

            <div className="flex h-11 w-8 shrink-0 items-center justify-center text-black transition duration-200 hover:text-black/55">
              <CartButton />
            </div>

            <div className="flex h-11 shrink-0 items-center justify-center px-1 text-black transition duration-200 hover:text-black/55 active:scale-[0.98]">
              <ProfileMenu
                fallbackIcon={<UserRound className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>

        <HeaderNavStrip />
      </header>

      <DesktopSidebarDrawer
        open={menuOpen}
        onClose={handleCloseMenu}
      />
    </>
  );
}