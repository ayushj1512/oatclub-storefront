"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/searchStore";

export default function HeaderSearchBar({ className = "" }) {
  const router = useRouter();

  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const searchProducts = useSearchStore((s) => s.searchProducts);

  const queryTrim = query.trim();

  const goSearchPage = () => {
    router.push("/search");
  };

  const handleSearch = async () => {
    if (!queryTrim || queryTrim.length < 2) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(queryTrim)}`);

    setTimeout(() => {
      searchProducts({
        page: 1,
        query: queryTrim,
      });
    }, 50);
  };

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    await handleSearch();
  };

  return (
    <div
      className={`
        group relative flex h-11 items-center
        border border-black/10 bg-white
        px-4
        transition duration-200
        hover:border-black/25
        focus-within:border-black/40
        ${className}
      `}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 transition group-focus-within:text-black" />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={goSearchPage}
        onClick={goSearchPage}
        onKeyDown={handleKeyDown}
        placeholder="Search products"
        className="
          h-full
          w-full
          bg-transparent
          pl-7
          pr-14
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-black
          outline-none
          placeholder:text-black/35
        "
      />

      <button
        type="button"
        onClick={handleSearch}
        className="
          absolute right-3 top-1/2
          flex -translate-y-1/2 items-center gap-1
          text-[9px] font-black uppercase tracking-[0.18em]
          text-black/45 transition duration-200
          hover:text-black active:scale-95
        "
        aria-label="Search"
      >
        Go
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}