"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCategoryStore } from "@/store/categoryStore";

export default function HotCategories() {
  const { categories, loading, fetchCategories, error } = useCategoryStore();

  useEffect(() => { fetchCategories({ active: true }); }, [fetchCategories]);

  const filteredCategories = useMemo(() => (categories || []).filter((cat) => cat?.isActive !== false).filter((cat) => cat?.slug && cat?.name).filter((cat) => cat.slug !== "uncategorized").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), [categories]);

  return (
    <section className="w-full py-4">
      {!loading && error && <p className="px-3 text-sm text-red-600">❌ {error}</p>}

      {loading && <div className="flex gap-3 overflow-x-auto no-scrollbar px-3">{[...Array(6)].map((_, i) => (<div key={i} className="aspect-square w-[85px] bg-gray-300 rounded-lg animate-pulse" />))}</div>}

      {!loading && <div className="hidden md:block overflow-x-auto no-scrollbar px-3"><div className="flex gap-6 w-max">{filteredCategories.map((cat) => (<Link key={cat._id} href={`/${cat.slug}`} className="flex flex-col items-center"><div className="aspect-square w-[150px] rounded-lg bg-gradient-to-b from-[#f2c7d1] to-[#800020] flex items-center justify-center overflow-hidden"><Image src={cat.image || "/placeholder.png"} alt={cat.name} width={150} height={150} className="object-contain p-2" /></div><p className="mt-1 text-[13px] font-semibold text-center uppercase">{cat.name}</p></Link>))}</div></div>}

      {!loading && <div className="md:hidden overflow-x-auto no-scrollbar px-3"><div className="flex gap-3 w-max snap-x snap-mandatory">{filteredCategories.map((cat) => (<Link key={cat._id} href={`/${cat.slug}`} className="flex flex-col items-center snap-start"><div className="aspect-square w-[90px] rounded-lg bg-gradient-to-b from-[#f2c7d1] to-[#800020] flex items-center justify-center overflow-hidden"><Image src={cat.image || "/placeholder.png"} alt={cat.name} width={90} height={90} className="object-contain p-2" /></div><p className="mt-1 text-[11px] font-semibold text-center uppercase">{cat.name}</p></Link>))}</div></div>}
    </section>
  );
}
