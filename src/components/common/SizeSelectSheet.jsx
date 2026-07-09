"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function SizeSelectSheet({
  open,
  onClose,
  sizes = [],
  selectedSize = "",
  onSelect,
  onConfirm,
  productName = "",
  adding = false,
}) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close size selector"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <div className="absolute bottom-0 left-0 right-0 rounded-t-[22px] bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/45">
              Select Size
            </p>
            <h3 className="mt-1 line-clamp-1 text-sm font-black uppercase tracking-[0.04em] text-black">
              {productName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-black"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {sizes.map((size) => {
            const active = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => onSelect?.(size)}
                className={`h-11 rounded-xl border text-xs font-black uppercase tracking-[0.08em] transition active:scale-[0.98] ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-white text-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selectedSize || adding}
          onClick={onConfirm}
          className="mt-4 h-11 w-full rounded-xl bg-black text-[11px] font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}