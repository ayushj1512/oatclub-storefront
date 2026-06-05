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
      className={`group relative flex h-11 items-center gap-2 border border-black/10 bg-white px-3 shadow-[0_10px_30px_rgba(0,0,0,0.035)] transition duration-200 focus-within:border-black hover:border-black/30 ${className}`}
    >
      <span className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-black transition duration-300 group-focus-within:scale-x-100" />

      <Search className="h-3.5 w-3.5 shrink-0 text-black/45 transition group-focus-within:text-black" />

      <span className="hidden shrink-0 text-[8px] font-black uppercase tracking-[0.2em] text-black/30 lg:inline">
        FIND
      </span>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={goSearchPage}
        onClick={goSearchPage}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        className="
          h-full
          min-w-0
          flex-1
          bg-transparent
          text-[11px]
          font-black
          uppercase
          tracking-[0.12em]
          text-black
          outline-none
          placeholder:text-black/35
        "
      />

      <button
        type="button"
        onClick={handleSearch}
        className="flex h-8 items-center justify-center gap-1.5 pl-2 text-[9px] font-black uppercase tracking-[0.16em] text-black/45 transition duration-200 hover:text-black active:scale-95"
        aria-label="SEARCH"
      >
        GO
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
