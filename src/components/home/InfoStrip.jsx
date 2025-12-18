"use client";

import { Truck, Tag, Factory, Diamond } from "lucide-react";
import { motion } from "framer-motion";

export default function InfoStrip() {
  const infos = [
    { title: "SHIPPING WITHIN 48 HOURS", desc: "Your order will be shipped within 48 hours from the time it is placed!", Icon: Truck },
    { title: "5% OFF || FREE DELIVERY", desc: "5% OFF on pre-paid orders.", Icon: Tag },
    { title: "MADE IN INDIA", desc: "100% Indian made — from raw fabric to final stitching!", Icon: Factory },
    { title: "LUXURY FASHION MADE ACCESSIBLE", desc: "Premium craftsmanship at fair and honest pricing.", Icon: Diamond },
  ];

  return (
    <section className="w-full bg-white px-4 pt-8 md:px-8">
      {/* Mobile: 2x2 grid | Desktop: 4 in a row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {infos.map(({ title, desc, Icon }, index) => (
          <motion.div
            key={index}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group flex items-center gap-3 bg-white p-3 transition-colors md:p-5"
          >
            {/* ✅ icon: no border, still “luxury” via soft tint + subtle shadow */}
            <div className="grid size-10 shrink-0 place-items-center bg-[#8000200a] shadow-[0_10px_24px_rgba(0,0,0,0.06)] md:size-11">
              <Icon className="h-5 w-5 text-[#800020] md:h-6 md:w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[11px] font-semibold tracking-wide leading-snug text-black md:text-[13px]">
                {title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-black/60 md:text-[12px]">
                {desc}
              </p>

              {/* ✅ tiny polish: refined underline on hover (desktop), no layout shift */}
              <span className="mt-2 hidden h-px w-10 bg-[#80002033] opacity-0 transition-opacity group-hover:opacity-100 md:block" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
