"use client";

import { Sparkles, BadgeCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-black/10 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
    </div>
  );
}

export default function InfoStrip() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const infos = [
    {
      title: "Specially Curated For You",
      desc: "Thoughtfully picked styles for your everyday statement.",
      Icon: Sparkles,
    },
    {
      title: "Quality Product",
      desc: "Clean finishing, soft fabrics and reliable craftsmanship.",
      Icon: BadgeCheck,
    },
    {
      title: "Stay In Trend",
      desc: "Fresh silhouettes inspired by what’s moving now.",
      Icon: TrendingUp,
    },
  ];

  return (
    <section className="w-full bg-white px-3 py-6 md:px-16 md:py-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4"
              >
                <Shimmer className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-3 w-2/3 rounded" />
                  <Shimmer className="h-3 w-full rounded" />
                </div>
              </div>
            ))
          : infos.map(({ title, desc, Icon }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="group flex items-start gap-3 rounded-2xl bg-gray-50 p-4 transition hover:bg-black hover:text-white"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-black shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold leading-snug text-current md:text-base">
                    {title}
                  </h3>

                  <p className="mt-1 text-xs leading-snug text-black/55 transition group-hover:text-white/65 md:text-sm">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
      </div>
    </section>
  );
}