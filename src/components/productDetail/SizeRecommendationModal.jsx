"use client";

import { useMemo, useState } from "react";
import { Check, Ruler, X } from "lucide-react";

const SIZE_CHART = [
  { size: "XS", bust: 32, waist: 25, hip: 33 },
  { size: "S", bust: 34, waist: 27, hip: 35 },
  { size: "M", bust: 36, waist: 29, hip: 37 },
  { size: "L", bust: 38, waist: 31, hip: 39 },
  { size: "XL", bust: 40, waist: 33, hip: 41 },
];

const getRecommendedSize = ({
  bust,
  waist,
  hip,
  availableSizes = [],
}) => {
  const body = {
    bust: Number(bust),
    waist: Number(waist),
    hip: Number(hip),
  };

  if (!body.bust || !body.waist || !body.hip) return null;

  const available = availableSizes
    .map((size) => String(size).trim().toUpperCase())
    .filter(Boolean);

  const sizes = SIZE_CHART.filter(
    ({ size }) => !available.length || available.includes(size)
  );

  if (!sizes.length) return null;

  return sizes
    .map((item) => {
      const difference =
        Math.abs(item.bust - body.bust) +
        Math.abs(item.waist - body.waist) +
        Math.abs(item.hip - body.hip);

      const tightnessPenalty =
        Math.max(0, body.bust - item.bust) * 12 +
        Math.max(0, body.waist - item.waist) * 12 +
        Math.max(0, body.hip - item.hip) * 12;

      return {
        ...item,
        score: difference + tightnessPenalty,
      };
    })
    .sort((a, b) => a.score - b.score)[0];
};

function MeasurementInput({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[0.12em]">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min="1"
          step="0.5"
          inputMode="decimal"
          className="h-10 w-full border border-black/20 bg-white px-3 pr-9 text-xs font-semibold outline-none placeholder:text-black/25 focus:border-black"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase text-black/40">
          IN
        </span>
      </div>
    </label>
  );
}

export default function SizeRecommendationModal({
  open,
  onClose,
  availableSizes = [],
  onSelectSize,
}) {
  const [measurements, setMeasurements] = useState({
    bust: "",
    waist: "",
    hip: "",
  });

  const [showResult, setShowResult] = useState(false);

  const recommendation = useMemo(
    () =>
      getRecommendedSize({
        ...measurements,
        availableSizes,
      }),
    [measurements, availableSizes]
  );

  const isComplete =
    Number(measurements.bust) > 0 &&
    Number(measurements.waist) > 0 &&
    Number(measurements.hip) > 0;

  if (!open) return null;

  const closeModal = () => {
    setShowResult(false);
    onClose?.();
  };

  const handleChange = ({ target }) => {
    setMeasurements((current) => ({
      ...current,
      [target.name]: target.value,
    }));

    setShowResult(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowResult(true);
  };

  const handleSelect = () => {
    if (!recommendation?.size) return;

    onSelectSize?.(recommendation.size);
    closeModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find your size"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 sm:items-center sm:p-4"
    >
      <div className="max-h-[88dvh] w-full overflow-y-auto bg-white sm:max-w-md">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-black/10 bg-white px-4 py-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Ruler size={13} />

              <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-black/45">
                OATCLUB FIT ASSIST
              </span>
            </div>

            <h2 className="mt-1 text-base font-extrabold uppercase leading-tight">
              Find Your Size
            </h2>

            <p className="mt-0.5 text-[10px] text-black/50">
              Enter body measurements in inches.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center transition hover:bg-black hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-3 gap-2">
            <MeasurementInput
              label="Bust"
              name="bust"
              value={measurements.bust}
              onChange={handleChange}
              placeholder="34"
            />

            <MeasurementInput
              label="Waist"
              name="waist"
              value={measurements.waist}
              onChange={handleChange}
              placeholder="27"
            />

            <MeasurementInput
              label="Hip"
              name="hip"
              value={measurements.hip}
              onChange={handleChange}
              placeholder="35"
            />
          </div>

          <div className="border border-black/10 bg-neutral-50 px-3 py-2.5 text-[10px] leading-4 text-black/55">
            <span className="font-bold text-black">Measure:</span> fullest bust,
            narrowest waist and fullest hip.
          </div>

          <button
            type="submit"
            disabled={!isComplete}
            className="h-10 w-full bg-black px-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/20"
          >
            Recommend My Size
          </button>

          {showResult && recommendation ? (
            <div className="bg-black p-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">
                    Closest Match
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-4xl font-extrabold leading-none">
                      {recommendation.size}
                    </span>

                    <span className="pb-1 text-[9px] font-bold uppercase tracking-wider text-white/60">
                      Recommended
                    </span>
                  </div>
                </div>

                <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-black">
                  <Check size={17} strokeWidth={3} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 border-y border-white/15 py-2 text-center">
                {[
                  ["Bust", recommendation.bust],
                  ["Waist", recommendation.waist],
                  ["Hip", recommendation.hip],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={
                      index === 1 ? "border-x border-white/15" : ""
                    }
                  >
                    <p className="text-[8px] uppercase tracking-wider text-white/45">
                      {label}
                    </p>

                    <p className="mt-0.5 text-xs font-bold">{value}&quot;</p>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[9px] leading-4 text-white/55">
                Recommendation may vary slightly by fabric and silhouette.
              </p>

              <button
                type="button"
                onClick={handleSelect}
                className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 bg-white px-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black hover:bg-neutral-200"
              >
                <Check size={14} />
                Select {recommendation.size}
              </button>
            </div>
          ) : null}

          {showResult && !recommendation ? (
            <p className="border border-red-200 bg-red-50 p-3 text-[10px] font-semibold text-red-700">
              No matching size is currently available.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}