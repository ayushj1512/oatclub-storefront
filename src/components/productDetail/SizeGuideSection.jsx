"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function SizeGuideSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-gray-200 py-3">

      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-base md:text-lg font-semibold text-black">
          Size Guide
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
          open ? "max-h-[700px] mt-3" : "max-h-0"
        }`}
      >
        <div className="text-gray-700 text-sm leading-relaxed space-y-4">

          <p className="font-medium text-black">How to Measure</p>

          <ul className="space-y-1">
            <li>• <strong>Bust:</strong> Measure around the fullest part of your chest.</li>
            <li>• <strong>Waist:</strong> Measure around the narrowest part of your waist.</li>
            <li>• <strong>Hips:</strong> Measure around the widest part of your hips.</li>
            <li>• <strong>Length:</strong> Measure from shoulder to hem.</li>
          </ul>

          <div className="pt-3">
            <p className="font-medium text-black mb-2">Size Chart (General)</p>

            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Size</th>
                  <th className="py-2">Bust</th>
                  <th className="py-2">Waist</th>
                  <th className="py-2">Hips</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-2">XS</td>
                  <td>30-32"</td>
                  <td>24-26"</td>
                  <td>32-34"</td>
                </tr>

                <tr className="border-b">
                  <td className="py-2">S</td>
                  <td>32-34"</td>
                  <td>26-28"</td>
                  <td>34-36"</td>
                </tr>

                <tr className="border-b">
                  <td className="py-2">M</td>
                  <td>34-36"</td>
                  <td>28-30"</td>
                  <td>36-38"</td>
                </tr>

                <tr className="border-b">
                  <td className="py-2">L</td>
                  <td>36-38"</td>
                  <td>30-32"</td>
                  <td>38-40"</td>
                </tr>

                <tr>
                  <td className="py-2">XL</td>
                  <td>38-40"</td>
                  <td>32-34"</td>
                  <td>40-42"</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}
