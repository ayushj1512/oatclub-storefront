"use client";

import { Truck, Tag, Factory, Diamond } from "lucide-react";

export default function InfoStrip() {
  const infos = [
    {
      title: "SHIPPING WITHIN 48 HOURS",
      desc: "Your order will be shipped within 48 hours from the time it is placed!",
      icon: <Truck className="w-7 h-7 text-pink-500" />,
    },
    {
      title: "5% OFF || FREE DELIVERY",
      desc: "5% OFF on Pre-paid orders.",
      icon: <Tag className="w-7 h-7 text-pink-500" />,
    },
    {
      title: "MADE IN INDIA",
      desc: "Our products are 100% made in India — from raw fabric to the final product!",
      icon: <Factory className="w-7 h-7 text-pink-500" />,
    },
    {
      title: "LUXURY FASHION MADE ACCESSIBLE",
      desc: "High-quality clothing at affordable prices.",
      icon: <Diamond className="w-7 h-7 text-pink-500" />,
    },
  ];

  return (
    <section className="w-full flex flex-col bg-white py-10 px-6">
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-stretch gap-8 md:gap-4">
        {infos.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row flex-1 items-center text-center md:text-left bg-gray-50 hover:bg-gray-100 transition rounded-3xl p-6 shadow-sm hover:shadow-md duration-300"
          >
            <div className="flex items-center justify-center mb-3 md:mb-0 md:mr-4">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 text-lg md:text-xl">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
