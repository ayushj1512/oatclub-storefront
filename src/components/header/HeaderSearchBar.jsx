"use client";

import { Search } from "lucide-react";
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
      className={`flex h-11 items-center gap-2 border-b border-black/15 bg-transparent px-1 transition duration-200 focus-within:border-black ${className}`}
    >
      <Search className="h-4 w-4 shrink-0 text-black/40" />

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
          text-[13px]
          font-medium
          text-black
          outline-none
          placeholder:text-black/35
        "
      />

      <button
        type="button"
        onClick={handleSearch}
        className="flex h-8 w-8 items-center justify-center text-black transition duration-200 hover:text-black/50 active:scale-95"
        aria-label="SEARCH"
      >
        <Search className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
