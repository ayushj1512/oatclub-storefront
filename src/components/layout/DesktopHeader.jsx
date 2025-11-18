"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ProfileMenu from "@/components/header/ProfileMenu";
import WishlistButton from "@/components/header/WishlistButton";
import CartButton from "@/components/header/CartButton";

export default function DesktopHeader() {
  const [searchText, setSearchText] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const router = useRouter();

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      router.push(`/search?query=${encodeURIComponent(searchText)}`);
    }
  };

  return (
    <header className="hidden md:flex bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="w-full flex items-center justify-between px-10 py-4">

        {/* LEFT: HAMBURGER + LOGO */}
        <div className="flex items-center gap-6">

          {/* HAMBURGER */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="p-2 rounded-full hover:bg-gray-100 transition text-gray-800 hover:text-[#800020]">
              <Menu size={26} />
            </button>

            {/* CATEGORY DROPDOWN */}
            {showCategories && (
              <div className="absolute top-12 bg-white shadow-xl border border-gray-100 rounded-xl w-64 z-50 animate-dropdown">
                {["Sarees", "Lehengas", "Kurtis", "Accessories"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/${cat.toLowerCase()}`}
                    className="px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 block transition"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* LOGO */}
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-gray-900 hover:opacity-80 transition"
          >
            MIRAY<span className="text-[#800020]">.</span>
          </Link>
        </div>

        {/* CENTER: SEARCH BAR */}
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

        {/* RIGHT: ICONS */}
        <div className="flex items-center gap-7 text-gray-700">
          <WishlistButton />
          <CartButton />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}


