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
    <section className="w-full bg-white py-8 px-4 md:px-8">
      {/* Mobile: 2x2 grid | Desktop: 4 in a row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {infos.map(({ title, desc, Icon }, index) => (
          <motion.div
            key={index}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="bg-white border border-black/10 hover:border-[#80002033] transition-colors p-3 md:p-5 flex items-center gap-3"
          >
            <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 border border-black/10 flex items-center justify-center bg-white">
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#800020]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-[11px] md:text-[13px] font-semibold text-black tracking-wide leading-snug line-clamp-2">
                {title}
              </h3>
              <p className="mt-1 text-[10px] md:text-[12px] text-black/60 leading-snug line-clamp-2">
                {desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
