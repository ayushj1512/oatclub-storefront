"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const img = (item) =>
  item?.productSnapshot?.thumbnail ||
  item?.productSnapshot?.images?.[0] ||
  "";

export default function RmaItemSelector({
  order,
  selectedItems,
  onChange,
  onBack,
  onContinue,
}) {
  const items = order?.items || [];

  const isSelected = (lineId) =>
    selectedItems.some((x) => String(x.lineId) === String(lineId));

  const toggleItem = (item) => {
    if (isSelected(item.lineId)) {
      onChange(selectedItems.filter((x) => x.lineId !== item.lineId));
      return;
    }

    onChange([...selectedItems, { ...item, rmaQuantity: 1 }]);
  };

  const updateQty = (lineId, qty) => {
    onChange(
      selectedItems.map((item) =>
        item.lineId === lineId
          ? { ...item, rmaQuantity: Math.max(1, Math.min(Number(qty), item.quantity)) }
          : item
      )
    );
  };

  const selectAll = () => {
    onChange(items.map((item) => ({ ...item, rmaQuantity: item.quantity || 1 })));
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Select products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select full order or partial products.
          </p>
        </div>

        <button
          onClick={selectAll}
          className="h-10 rounded-2xl bg-gray-100 px-4 text-sm font-medium"
        >
          Select full order
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const selected = isSelected(item.lineId);
          const selectedItem = selectedItems.find((x) => x.lineId === item.lineId);

          return (
            <div
              key={item.lineId}
              className={`rounded-3xl p-4 ring-1 transition ${
                selected ? "bg-gray-950 text-white ring-gray-950" : "bg-gray-50 ring-gray-100"
              }`}
            >
              <div className="flex gap-4">
                <button
                  onClick={() => toggleItem(item)}
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ${
                    selected ? "bg-white text-gray-950 ring-white" : "bg-white ring-gray-200"
                  }`}
                >
                  {selected ? <Check className="h-4 w-4" /> : null}
                </button>

                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  {img(item) ? (
                    <img src={img(item)} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">
                    {item?.productSnapshot?.title || "Product"}
                  </h3>

                  <p className={`mt-1 text-xs ${selected ? "text-gray-300" : "text-gray-500"}`}>
                    Code: {item?.productSnapshot?.productCode || "-"} · Size:{" "}
                    {item?.selectedSize || item?.variant?.attributes?.[0]?.value || "-"} · Qty:{" "}
                    {item?.quantity || 1}
                  </p>

                  {selected ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-300">Request qty</span>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={selectedItem?.rmaQuantity || 1}
                        onChange={(e) => updateQty(item.lineId, e.target.value)}
                        className="h-9 w-20 rounded-xl bg-white px-3 text-sm text-gray-950 outline-none"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={onBack} className="h-11 rounded-2xl bg-gray-100 px-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </span>
        </button>

        <button
          disabled={!selectedItems.length}
          onClick={onContinue}
          className="h-11 rounded-2xl bg-gray-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </section>
  );
}