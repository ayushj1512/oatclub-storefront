"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    label: "DRESSES",
    href: "/category/dresses",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "TOPS",
    href: "/category/tops",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "BOTTOMS",
    href: "/category/bottoms",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=82",
  },
  {
    label: "CO-ORD SETS",
    href: "/category/co-ords-set",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=82",
  },
];

export default function CategoryMosaic() {
  return (
    <section className="w-full bg-white px-3 pb-5 text-black md:px-8 md:py-8">
      <div className="w-full">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-black/10 pb-3">
        </div>

        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
          {CATEGORIES.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative aspect-[4/5] overflow-hidden bg-neutral-100 md:aspect-[3/4]"
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 50vw, 620px"
                priority={index < 2}
                className="object-cover transition duration-500 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-5">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white drop-shadow md:text-sm">
                  {item.label}
                </span>
                <span className="grid h-8 w-8 place-items-center border border-white/40 bg-white/15 text-white opacity-90 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/all-clothing"
          className="mt-3 flex h-10 items-center justify-center gap-2 border border-black text-[10px] font-black uppercase tracking-[0.18em] text-black md:hidden"
        >
          ALL CLOTHING
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
