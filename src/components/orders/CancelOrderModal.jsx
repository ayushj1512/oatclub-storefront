"use client";

import { useEffect, useMemo, useState } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

const CANCEL_REASONS = [
  "I ordered by mistake",
  "I want to change size / color",
  "I want to change delivery address",
  "I found a better option",
  "Delivery may take too long",
  "I placed a duplicate order",
  "Payment or order issue",
  "I no longer need this item",
  "I want to add/remove products",
  "Other",
];

export default function CancelOrderModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  order,
  orderNumber = "",
}) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const displayOrderNumber = order?.orderNumber || orderNumber;

  const finalReason = useMemo(() => {
    const cleanReason = reason.trim();
    const cleanNote = note.trim();

    if (!cleanReason && !cleanNote) return "";
    if (cleanReason === "Other") return cleanNote || "Other";
    if (cleanNote) return `${cleanReason} - ${cleanNote}`;

    return cleanReason;
  }, [reason, note]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setReason("");
      setNote("");
    }
  }, [open]);

  if (!open) return null;

  const closeModal = () => {
    if (loading) return;
    setStep(1);
    setReason("");
    setNote("");
    onClose?.();
  };

  const confirmCancel = () => {
    onConfirm?.(finalReason || "");
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
                Step {step} of 2
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-black">
                Cancel Order
              </h2>

              {displayOrderNumber ? (
                <p className="mt-1 text-xs font-medium text-black/45">
                  #{displayOrderNumber}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="rounded-full p-2 text-black/45 transition hover:bg-black/[0.05] hover:text-black disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {step === 1 ? (
            <>
              <h3 className="text-xl font-semibold tracking-tight text-black">
                Why do you want to cancel?
              </h3>
              <p className="mt-1 text-sm leading-6 text-black/55">
                Choose a reason. You can skip the note if you don’t want to add
                anything.
              </p>

              <div className="mt-5 space-y-2">
                {CANCEL_REASONS.map((item) => {
                  const active = reason === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setReason(item)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "bg-black text-white"
                          : "bg-black/[0.035] text-black hover:bg-black/[0.06]"
                      }`}
                    >
                      <span>{item}</span>
                      {active ? <CheckCircle2 size={17} /> : null}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Optional note, e.g. I want to change my address..."
                className="mt-4 w-full resize-none rounded-2xl bg-black/[0.035] px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:bg-white focus:ring-2 focus:ring-black/10"
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold tracking-tight text-black">
                Confirm cancellation
              </h3>
              <p className="mt-1 text-sm leading-6 text-black/55">
                Your order will be cancelled. This action cannot be undone.
              </p>

              <div className="mt-5 rounded-3xl bg-black/[0.035] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                  Selected reason
                </p>
                <p className="mt-2 text-sm font-semibold text-black">
                  {reason || "No reason selected"}
                </p>

                {note.trim() ? (
                  <p className="mt-2 text-sm leading-6 text-black/55">
                    {note.trim()}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                Please cancel only if you’re sure. Once cancelled, the order
                cannot be shipped.
              </div>
            </>
          )}
        </div>

        <div className="border-t border-black/[0.06] bg-white px-5 py-4">
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-full bg-black/[0.05] px-4 py-3 text-sm font-semibold text-black/70 transition hover:bg-black/[0.08] disabled:opacity-40"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="rounded-full bg-black/[0.05] px-4 py-3 text-sm font-semibold text-black/70 transition hover:bg-black/[0.08] disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={confirmCancel}
                disabled={loading}
                className="rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}