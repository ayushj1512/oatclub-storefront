"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { wcGet } from "@/lib/woocommerce";

export default function HotCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await wcGet("products/categories?per_page=100");
        const filtered = data.filter(
          (cat) => cat.slug !== "uncategorized" && cat.count > 0
        );
        setCategories(filtered);
      } catch (err) {
        console.error("❌ Hot Categories Fetch Error:", err);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // SPLIT INTO TWO ROWS FOR MOBILE
  const row1 = categories.filter((_, i) => i % 2 === 0);
  const row2 = categories.filter((_, i) => i % 2 !== 0);

  return (
    <section className="w-full py-4">

      {/* LOADING STATE */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square w-[85px] bg-gray-300 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* DESKTOP → scrolling horizontal row */}
      {!loading && (
        <div className="hidden md:block overflow-x-auto no-scrollbar px-3">
          <div className="flex gap-6 w-max">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}/${cat.id}`} className="flex flex-col items-center">
                <div className="aspect-square w-[150px] rounded-lg bg-gradient-to-b from-[#f2c7d1] to-[#800020] flex items-center justify-center overflow-hidden">
                  <Image src={cat.image?.src || "/placeholder.png"} alt={cat.name} width={150} height={150} className="object-contain p-2" />
                </div>
                <p className="mt-1 text-[13px] font-semibold text-center uppercase">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE → TWO INDIVIDUAL HORIZONTAL SCROLL ROWS */}
      {!loading && (
        <div className="md:hidden flex flex-col gap-4 px-3">

          {/* ROW 1 */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {row1.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}/${cat.id}`} className="flex flex-col items-center snap-start">
                <div className="aspect-square w-[90px] rounded-lg bg-gradient-to-b from-[#f2c7d1] to-[#800020] flex items-center justify-center overflow-hidden">
                  <Image src={cat.image?.src || "/placeholder.png"} alt={cat.name} width={90} height={90} className="object-contain p-2" />
                </div>
                <p className="mt-1 text-[11px] font-semibold text-center uppercase">{cat.name}</p>
              </Link>
            ))}
          </div>

          {/* ROW 2 */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {row2.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}/${cat.id}`} className="flex flex-col items-center snap-start">
                <div className="aspect-square w-[90px] rounded-lg bg-gradient-to-b from-[#f2c7d1] to-[#800020] flex items-center justify-center overflow-hidden">
                  <Image src={cat.image?.src || "/placeholder.png"} alt={cat.name} width={90} height={90} className="object-contain p-2" />
                </div>
                <p className="mt-1 text-[11px] font-semibold text-center uppercase">{cat.name}</p>
              </Link>
            ))}
          </div>

        </div>
      )}

    </section>
  );
}
