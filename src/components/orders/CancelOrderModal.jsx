"use client";

import { useMemo, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found cheaper elsewhere",
  "Delivery taking too long",
  "Need to change address",
  "Need to change item",
  "Other",
];

export default function CancelOrderModal({ open, onClose, onConfirm, loading = false, orderNumber = "" }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const canContinue = useMemo(() => !!reason, [reason]);

  if (!open) return null;

  const resetAndClose = () => {
    setStep(1);
    setReason("");
    setNote("");
    onClose?.();
  };

  const fullReason = reason === "Other" ? `Other: ${note}` : note ? `${reason} - ${note}` : reason;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <button onClick={resetAndClose} className="absolute right-4 top-4 rounded-full bg-black/5 p-2 hover:bg-black/10 transition">
          <X size={18} className="text-black/70" />
        </button>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5">
              <AlertTriangle size={18} className="text-black" />
            </div>
            <div>
              <p className="text-xs text-black/50">Step {step} of 2</p>
              <p className="text-base font-semibold text-black">Cancel Order</p>
                        {orderNumber ? <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">#{orderNumber}</span> : null}

            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-xl font-semibold text-black mb-2">Why are you cancelling?</h2>
            <p className="text-sm text-black/60 mb-4">Select a reason. This helps us improve your experience.</p>

            <div className="space-y-3">
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-2xl bg-black/5 px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/20">
                <option value="" disabled>
                  Choose a reason…
                </option>
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note (example: want address change)" className="w-full min-h-[90px] rounded-2xl bg-black/5 px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/20" />
            </div>

            <button disabled={!canContinue} onClick={() => setStep(2)} className={`mt-5 w-full rounded-full py-3 text-sm font-semibold transition ${canContinue ? "bg-black text-white hover:opacity-90" : "bg-black/10 text-black/30 cursor-not-allowed"}`}>
              Continue
            </button>

            <button onClick={resetAndClose} className="mt-3 w-full rounded-full py-3 text-sm font-semibold bg-black/5 text-black/70 hover:bg-black/10 transition">
              Keep Order
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-black mb-2">Confirm cancellation</h2>
            <p className="text-sm text-black/60 mb-4">This action cannot be undone.</p>

            <div className="rounded-2xl bg-black/5 p-4 mb-6">
              <p className="text-xs font-semibold text-black/60 mb-1">Reason</p>
              <p className="text-sm font-semibold text-black">{reason}</p>
              {note ? <p className="mt-2 text-xs text-black/50">Note: {note}</p> : null}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-full py-3 text-sm font-semibold bg-black/5 text-black hover:bg-black/10 transition">
                Back
              </button>
              <button disabled={loading} onClick={() => onConfirm?.(fullReason)} className="flex-1 rounded-full py-3 text-sm font-semibold bg-black text-white hover:opacity-90 transition">
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>

            <button onClick={resetAndClose} className="mt-4 w-full rounded-full py-3 text-sm font-semibold bg-black/5 text-black/70 hover:bg-black/10 transition">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
