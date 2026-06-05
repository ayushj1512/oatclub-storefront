"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Home, RefreshCcw, Search, ShoppingBag } from "lucide-react";

const QUICK_LINKS = [
  ["NEW ARRIVALS", "/new-arrivals"],
  ["BESTSELLERS", "/bestseller"],
  ["ALL CLOTHING", "/all-clothing"],
  ["SUPPORT", "/support"],
];

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-3 py-5 text-black md:px-8 md:py-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative overflow-hidden border border-black bg-black p-4 text-white md:p-6">
          <div className="absolute inset-x-0 top-0 grid grid-cols-12 opacity-30">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="h-14 border-r border-white/20 last:border-r-0" />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/55">
              OATCLUB ROUTE CHECK
            </p>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
              NO AUTO REDIRECT
            </span>
          </div>

          <div className="relative z-10 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-3 gap-2 text-[22vw] font-black leading-none tracking-[-0.02em] md:text-[9rem] lg:text-[11rem]"
            >
              {["4", "0", "4"].map((digit, index) => (
                <span
                  key={`${digit}-${index}`}
                  className="grid aspect-[3/4] place-items-center border border-white/15 bg-white text-black"
                >
                  {digit}
                </span>
              ))}
            </motion.div>

            <motion.div
              aria-hidden
              className="mt-4 h-1 bg-white"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 0.45, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />

            <div className="mt-5 grid grid-cols-3 gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/45">
              <span>LINK MISSING</span>
              <span className="text-center">EDIT RECOVERABLE</span>
              <span className="text-right">HOME READY</span>
            </div>
          </div>
        </div>

        <div className="border border-black/10 bg-[#fbfbfb] p-4 md:p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.32em] text-black/40">
            PAGE NOT FOUND
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase leading-tight md:text-4xl">
            THIS EDIT SLIPPED OUT OF THE RACK.
          </h1>
          <p className="mt-3 max-w-xl text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/55 md:text-sm">
            The URL may be old, mistyped, or moved. We can take you back home, into the product
            edit, or straight to search.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link
              href="/"
              className="flex h-11 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.18em] text-white"
            >
              <Home className="h-4 w-4" />
              GO HOME
            </Link>
            <Link
              href="/search"
              className="flex h-11 items-center justify-center gap-2 border border-black text-[10px] font-black uppercase tracking-[0.18em] text-black"
            >
              <Search className="h-4 w-4" />
              SEARCH
            </Link>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link
              href="/products"
              className="flex h-10 items-center justify-center gap-2 border border-black/10 bg-white text-[9px] font-black uppercase tracking-[0.16em] text-black"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              BROWSE PRODUCTS
            </Link>
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="flex h-10 items-center justify-center gap-2 border border-black/10 bg-white text-[9px] font-black uppercase tracking-[0.16em] text-black"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              RELOAD
            </button>
          </div>

          <div className="mt-5">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/35">
              QUICK ROUTES
            </p>
            <div className="mt-2 grid gap-1.5">
              {QUICK_LINKS.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between border-b border-black/10 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/65 transition hover:text-black"
                >
                  {label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              router.back();
            }}
            className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/55 underline underline-offset-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            GO BACK
          </button>
        </div>
      </section>
    </main>
  );
}
