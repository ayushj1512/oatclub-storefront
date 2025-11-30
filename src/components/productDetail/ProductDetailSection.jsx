"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function ProductDetailSection({
  title = "Product Details",
  content = "",
}) {
  // ⭐ OPEN BY DEFAULT
  const [open, setOpen] = useState(true);

  return (
    <div className="border-t border-gray-200 py-3">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-base md:text-lg font-semibold text-black">
          {title}
        </span>

        {open ? (
          <Minus className="h-5 w-5 text-black" />
        ) : (
          <Plus className="h-5 w-5 text-black" />
        )}
      </button>

      {/* BODY */}
      <div
        className={`transition-all overflow-hidden duration-300 ${
          open ? "max-h-[600px] mt-2" : "max-h-0"
        }`}
      >
        <div
          className="text-gray-700 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
