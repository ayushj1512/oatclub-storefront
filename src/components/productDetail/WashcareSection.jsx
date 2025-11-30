"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function WashcareSection({ title = "Washcare & Instructions", items = [] }) {
  const [open, setOpen] = useState(false);

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
          open ? "max-h-96 mt-2" : "max-h-0"
        }`}
      >
        <ul className="text-gray-700 text-sm leading-relaxed space-y-1 pl-1">
          {items.map((text, index) => (
            <li key={index} className="flex gap-2">
              <span className="font-bold text-black">•</span> {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
