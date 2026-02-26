// src/components/orders/ReturnFileModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import PayoutDetailsForm from "@/components/profile/PayoutDetailsForm";

const s = (v) => String(v ?? "").trim();

export default function ReturnFileModal({
  open,
  onClose,
  item,
  itemName = "Item",
  customer,
  onSavePayout, // async (payload) => truthy
  onSubmitReturn, // async ({ item, reason }) => void
  loading = false,
}) {
  const [step, setStep] = useState("reason"); // reason | payout
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("reason");
    setReason("");
  }, [open, item?.lineId]);

  const canContinue = useMemo(() => !!s(reason), [reason]);
  const busy = !!loading;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-3xl p-4 sm:p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/5 p-2 rounded-full hover:bg-black/10 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Return Request</h3>

            {step === "payout" ? (
              <button
                onClick={() => setStep("reason")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/5 text-gray-900 text-xs font-semibold hover:bg-black/10 transition"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : null}
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {step === "reason"
              ? `Select a reason for returning ${itemName}.`
              : "Confirm your refund details to continue."}
          </p>
        </div>

        {step === "reason" ? (
          <>
            <select
              className="mt-4 w-full rounded-2xl bg-gray-100 p-3 text-sm outline-none"
              onChange={(e) => setReason(e.target.value)}
              value={reason}
            >
              <option value="" disabled>
                Choose a reason…
              </option>
              <option value="Size too small">Size too small</option>
              <option value="Size too large">Size too large</option>
              <option value="Wrong item received">Wrong item received</option>
              <option value="Damaged product">Damaged product</option>
              <option value="Not as described">Not as described</option>
            </select>

            <button
              disabled={!canContinue || busy}
              onClick={() => {
                if (!canContinue) return toast.error("Please select a reason.");
                setStep("payout");
              }}
              className={`mt-4 w-full rounded-2xl py-3 text-sm font-semibold transition ${
                canContinue && !busy
                  ? "bg-black text-white hover:opacity-90"
                  : "bg-black/10 text-black/40 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Next step: refund details
            </p>
          </>
        ) : (
          <div className="mt-4">
            <PayoutDetailsForm
              customer={customer}
              onSave={onSavePayout}
              loading={busy}
              onConfirm={async () => {
                if (!item?.lineId) {
                  toast.error("Item not found.");
                  return;
                }
                if (!s(reason)) {
                  toast.error("Return reason missing.");
                  setStep("reason");
                  return;
                }
                await onSubmitReturn?.({ item, reason });
                onClose?.();
              }}
            />

            <button
              onClick={onClose}
              disabled={busy}
              className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold bg-black/5 text-gray-900 hover:bg-black/10 disabled:opacity-40 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}