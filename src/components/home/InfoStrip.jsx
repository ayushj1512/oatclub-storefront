"use client";

import { Truck, Tag, Factory, Diamond } from "lucide-react";
import { motion } from "framer-motion";

export default function InfoStrip() {
  const infos = [
    {
      title: "SHIPPING WITHIN 48 HOURS",
      desc: "Your order will be shipped within 48 hours from the time it is placed!",
      icon: <Truck className="w-9 h-9 text-[#800020]" />,
    },
    {
      title: "5% OFF || FREE DELIVERY",
      desc: "5% OFF on pre-paid orders.",
      icon: <Tag className="w-9 h-9 text-[#800020]" />,
    },
    {
      title: "MADE IN INDIA",
      desc: "100% Indian made — from raw fabric to final stitching!",
      icon: <Factory className="w-9 h-9 text-[#800020]" />,
    },
    {
      title: "LUXURY FASHION MADE ACCESSIBLE",
      desc: "Premium craftsmanship at fair and honest pricing.",
      icon: <Diamond className="w-9 h-9 text-[#800020]" />,
    },
  ];

  return (
    <section className="w-full bg-white py-12 px-4 md:px-8">
      <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto no-scrollbar md:overflow-visible">
        
       {infos.map((item, index) => (
  <motion.div
    key={index}
    whileHover={{ scale: 1.04, y: -4 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="min-w-[75%] sm:min-w-[55%] md:min-w-0 flex flex-col items-center justify-center bg-white rounded-2xl p-6 border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_26px_rgba(128,0,32,0.15)] hover:border-[#80002020] text-center transition-all duration-300 flex-1"
  >
    <div className="flex items-center justify-center mb-4">
      {item.icon}
    </div>

    <h3 className="font-semibold text-black text-lg md:text-xl tracking-tight">
      {item.title}
    </h3>

    <p className="text-gray-600 text-sm md:text-base mt-2 leading-relaxed">
      {item.desc}
    </p>
  </motion.div>
))}

      </div>
    </section>
  );
}
