"use client";

import { Truck, Tag, Factory, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* 🔥 Shimmer block */
function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default function InfoStrip() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // short shimmer for smooth page load
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const infos = [
    {
      title: "SHIPPING WITHIN 48 HOURS",
      desc: "Your order will be shipped within 48 hours from the time it is placed!",
      Icon: Truck,
    },
    {
      title: "5% OFF || FREE DELIVERY",
      desc: "5% OFF on pre-paid orders.",
      Icon: Tag,
    },
    {
      title: "MADE IN INDIA",
      desc: "100% Indian made — from raw fabric to final stitching!",
      Icon: Factory,
    },
    {
      title: "LUXURY FASHION MADE ACCESSIBLE",
      desc: "Premium craftsmanship at fair and honest pricing.",
      Icon: Diamond,
    },
  ];

  return (
    <section className="w-full bg-white px-4 pt-8 md:px-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white p-3 md:p-5"
              >
                {/* icon shimmer */}
                <Shimmer className="size-10 md:size-11 rounded-md" />

                {/* text shimmer */}
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-3 w-4/5 rounded" />
                  <Shimmer className="h-3 w-full rounded" />
                </div>
              </div>
            ))
          : infos.map(({ title, desc, Icon }, index) => (
              <motion.div
                key={index}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="group flex items-center gap-3 bg-white p-3 transition-colors md:p-5"
              >
                {/* icon */}
                <div className="grid size-10 shrink-0 place-items-center bg-black/5 shadow-[0_10px_24px_rgba(0,0,0,0.06)] md:size-11 rounded-md">
                  <Icon className="h-5 w-5 text-black md:h-6 md:w-6" />
                </div>

                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-[11px] font-semibold tracking-wide leading-snug text-black md:text-[13px]">
                    {title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-black/60 md:text-[12px]">
                    {desc}
                  </p>

                  <span className="mt-2 hidden h-px w-10 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 md:block" />
                </div>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
