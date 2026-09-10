"use client";

import { X } from "lucide-react";
import { useEffect, useMemo } from "react";

const normalizeSize = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

export default function SizeSelectSheet({
  open,
  onClose,
  sizes = [],
  sizeOptions = [],
  selectedSize = "",
  onSelect,
  onConfirm,
  productName = "",
  adding = false,
}) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const options = useMemo(() => {
    if (
      Array.isArray(sizeOptions) &&
      sizeOptions.length
    ) {
      return sizeOptions.map((option) => ({
        ...option,
        size: normalizeSize(option?.size),
        available:
          option?.available !== false,
        availableStock:
          option?.availableStock == null
            ? null
            : Number(
              option.availableStock,
            ),
      }));
    }

    return sizes.map((size) => ({
      size: normalizeSize(size),
      available: true,
      availableStock: null,
    }));
  }, [sizes, sizeOptions]);

  const normalizedSelectedSize =
    normalizeSize(selectedSize);

  const selectedOption = options.find(
    (option) =>
      option.size ===
      normalizedSelectedSize,
  );

  const selectedIsAvailable =
    selectedOption?.available === true;

  const selectedAvailableStock =
    selectedOption?.availableStock;

  const showLowStock =
    selectedIsAvailable &&
    Number.isFinite(
      selectedAvailableStock,
    ) &&
    selectedAvailableStock > 0 &&
    selectedAvailableStock <= 5;

  const handleConfirm = () => {
    if (
      !normalizedSelectedSize ||
      !selectedIsAvailable ||
      adding
    ) {
      return;
    }

    onConfirm?.();
  };

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
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-black"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {options.map((option) => {
            const active =
              option.available &&
              normalizedSelectedSize ===
              option.size;

            return (
              <button
                key={option.size}
                type="button"
                disabled={
                  !option.available
                }
                onClick={() =>
                  option.available &&
                  onSelect?.(option.size)
                }
                className={`h-11 rounded-xl border text-xs font-black uppercase tracking-[0.08em] transition ${!option.available
                    ? "cursor-not-allowed border-neutral-100 bg-neutral-100 text-neutral-300 line-through"
                    : active
                      ? "border-black bg-black text-white active:scale-[0.98]"
                      : "border-neutral-200 bg-white text-black active:scale-[0.98]"
                  }`}
              >
                {option.size}
              </button>
            );
          })}
        </div>

        {showLowStock && (
          <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
              Only{" "}
              {selectedAvailableStock}{" "}
              {selectedAvailableStock === 1
                ? "piece"
                : "pieces"}{" "}
              left — almost gone
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={
            !normalizedSelectedSize ||
            !selectedIsAvailable ||
            adding
          }
          onClick={handleConfirm}
          className="mt-4 h-11 w-full rounded-xl bg-black text-[11px] font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {adding
            ? "Adding..."
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
