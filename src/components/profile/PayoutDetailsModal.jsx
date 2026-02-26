"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Pencil, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/* ----------------- helpers ----------------- */
const s = (v) => String(v ?? "").trim();

const maskAcc = (acc) => {
  const a = s(acc);
  if (a.length <= 4) return a ? `****${a}` : "";
  return `${"*".repeat(Math.max(0, a.length - 4))}${a.slice(-4)}`;
};

const getExistingPayout = (customer) => {
  // supports both schemas
  const payout = customer?.payoutDetails || null;
  const bankDetails = customer?.bankDetails || null;

  const bank =
    payout?.bank ||
    bankDetails?.bank ||
    (bankDetails?.accountNumber ? bankDetails : null) ||
    null;

  const upi = payout?.upi || bankDetails?.upi || null;

  const bankOut = bank
    ? {
        accountHolderName: s(bank.accountHolderName),
        accountNumber: s(bank.accountNumber),
        ifscCode: s(bank.ifscCode).toUpperCase(),
      }
    : { accountHolderName: "", accountNumber: "", ifscCode: "" };

  const upiOut = upi ? { upiId: s(upi.upiId).toLowerCase() } : { upiId: "" };

  const hasBank = !!(bankOut.accountHolderName && bankOut.accountNumber && bankOut.ifscCode);
  const hasUpi = !!upiOut.upiId;

  return { bank: bankOut, upi: upiOut, hasBank, hasUpi };
};

export default function PayoutDetailsModal({
  open,
  onClose,
  customer,
  onConfirm, // call when user confirms existing OR after saving
  onSave,    // async (payload) => updatedCustomer/payout
}) {
  const existing = useMemo(() => getExistingPayout(customer), [customer]);

  const [mode, setMode] = useState("confirm"); // confirm | edit
  const [method, setMethod] = useState("bank"); // bank | upi
  const [saving, setSaving] = useState(false);

  const [bank, setBank] = useState(existing.bank);
  const [upi, setUpi] = useState(existing.upi);

  useEffect(() => {
    if (!open) return;
    // prefill on open
    const ex = getExistingPayout(customer);
    setBank(ex.bank);
    setUpi(ex.upi);
    setMethod(ex.hasUpi && !ex.hasBank ? "upi" : "bank");
    setMode(ex.hasBank || ex.hasUpi ? "confirm" : "edit");
  }, [open, customer]);

  if (!open) return null;

  const hasExisting = existing.hasBank || existing.hasUpi;

  const canConfirmExisting =
    mode === "confirm" && hasExisting && (existing.hasBank || existing.hasUpi);

  const validate = () => {
    if (method === "upi") {
      if (!s(upi.upiId)) return "Enter UPI ID";
      return null;
    }
    // bank
    if (!s(bank.accountHolderName)) return "Enter Account Holder Name";
    if (!s(bank.accountNumber)) return "Enter Account Number";
    if (!s(bank.ifscCode)) return "Enter IFSC Code";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      const payload =
        method === "upi"
          ? { upi: { upiId: s(upi.upiId).toLowerCase() } }
          : {
              bank: {
                accountHolderName: s(bank.accountHolderName),
                accountNumber: s(bank.accountNumber),
                ifscCode: s(bank.ifscCode).toUpperCase(),
              },
            };

      const out = await onSave?.(payload);
      if (!out) return; // store already shows toast

      // after save, confirm + proceed
      onConfirm?.();
    } finally {
      setSaving(false);
    }
  };

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
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Refund Details
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Refund process fast karne ke liye aapke payout details chahiye.
          </p>
        </div>

        {/* Existing details (customer friendly confirm) */}
        {mode === "confirm" && hasExisting ? (
          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Saved payout details
                </p>

                {existing.hasUpi ? (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">UPI:</span>{" "}
                    {s(existing.upi.upiId) || "-"}
                  </p>
                ) : null}

                {existing.hasBank ? (
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {s(existing.bank.accountHolderName) || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Account:</span>{" "}
                      {maskAcc(existing.bank.accountNumber) || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">IFSC:</span>{" "}
                      {s(existing.bank.ifscCode) || "-"}
                    </p>
                  </div>
                ) : null}
              </div>

              <button
                onClick={() => setMode("edit")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-black text-white text-xs font-semibold hover:opacity-90 transition"
              >
                <Pencil size={14} />
                Edit
              </button>
            </div>

            <button
              onClick={() => onConfirm?.()}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold bg-black text-white hover:opacity-90 transition"
            >
              <CheckCircle2 size={16} />
              Confirm & Continue
            </button>

            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Agar details wrong hain, “Edit” karke update kar sakte hain.
            </p>
          </div>
        ) : (
          <>
            {/* Edit / Add details */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setMethod("bank")}
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  method === "bank" ? "bg-black text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Bank
              </button>
              <button
                onClick={() => setMethod("upi")}
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  method === "upi" ? "bg-black text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                UPI
              </button>
            </div>

            {method === "upi" ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-600">UPI ID</label>
                  <input
                    value={upi.upiId}
                    onChange={(e) => setUpi({ upiId: e.target.value })}
                    placeholder="example@upi"
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Account Holder Name</label>
                  <input
                    value={bank.accountHolderName}
                    onChange={(e) => setBank((p) => ({ ...p, accountHolderName: e.target.value }))}
                    placeholder="Full name"
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Account Number</label>
                  <input
                    value={bank.accountNumber}
                    onChange={(e) => setBank((p) => ({ ...p, accountNumber: e.target.value }))}
                    placeholder="XXXXXXXXXXXX"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">IFSC Code</label>
                  <input
                    value={bank.ifscCode}
                    onChange={(e) => setBank((p) => ({ ...p, ifscCode: e.target.value }))}
                    placeholder="SBIN0001234"
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {hasExisting ? (
                <button
                  onClick={() => setMode("confirm")}
                  className="flex-1 rounded-2xl py-3 text-sm font-semibold bg-black/5 text-gray-900 hover:bg-black/10 transition"
                >
                  Back
                </button>
              ) : null}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[1.4] rounded-2xl py-3 text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-40 transition inline-flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                {saving ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}