// src/components/profile/PayoutDetailsForm.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const s = (v) => String(v ?? "").trim();

const maskAcc = (acc) => {
  const a = s(acc);
  if (!a) return "-";
  if (a.length <= 4) return `****${a}`;
  return `${"*".repeat(Math.max(0, a.length - 4))}${a.slice(-4)}`;
};

const getExistingPayout = (customer) => {
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

export default function PayoutDetailsForm({
  customer,
  onSave, // async (payload) => truthy on success
  onConfirm, // async () => void (proceed)
  loading = false,
}) {
  const existing = useMemo(() => getExistingPayout(customer), [customer]);
  const hasExisting = existing.hasBank || existing.hasUpi;

  const [mode, setMode] = useState("confirm"); // confirm | edit
  const [method, setMethod] = useState("bank"); // bank | upi
  const [saving, setSaving] = useState(false);

  const [bank, setBank] = useState(existing.bank);
  const [upi, setUpi] = useState(existing.upi);

  useEffect(() => {
    const ex = getExistingPayout(customer);
    setBank(ex.bank);
    setUpi(ex.upi);
    setMethod(ex.hasUpi && !ex.hasBank ? "upi" : "bank");
    setMode(ex.hasBank || ex.hasUpi ? "confirm" : "edit");
  }, [customer]);

  const busy = !!loading || saving;

  const validate = () => {
    if (method === "upi") {
      if (!s(upi.upiId)) return "Please enter a UPI ID.";
      return null;
    }
    if (!s(bank.accountHolderName)) return "Please enter the account holder name.";
    if (!s(bank.accountNumber)) return "Please enter the account number.";
    if (!s(bank.ifscCode)) return "Please enter the IFSC code.";
    return null;
  };

  const proceed = async () => {
    if (busy) return;
    setSaving(true);
    try {
      await onConfirm?.();
    } catch (e) {
      toast.error(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.error(err);
    if (busy) return;

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
      if (!out) return;

      await onConfirm?.();
    } catch (e) {
      toast.error(e?.message || "Unable to save details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Refund Details</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Confirm where you would like to receive your refund.
        </p>
      </div>

      {mode === "confirm" && hasExisting ? (
        <div className="mt-3 rounded-2xl bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Saved details</p>

              {existing.hasUpi ? (
                <p className="text-sm text-gray-700 mt-2 break-words">
                  <span className="font-semibold">UPI:</span> {s(existing.upi.upiId) || "-"}
                </p>
              ) : null}

              {existing.hasBank ? (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p className="break-words">
                    <span className="font-semibold">Name:</span>{" "}
                    {s(existing.bank.accountHolderName) || "-"}
                  </p>
                  <p className="break-words">
                    <span className="font-semibold">Account:</span> {maskAcc(existing.bank.accountNumber)}
                  </p>
                  <p className="break-words">
                    <span className="font-semibold">IFSC:</span> {s(existing.bank.ifscCode) || "-"}
                  </p>
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setMode("edit")}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-black text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <button
            onClick={proceed}
            disabled={busy}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-40 transition"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            {busy ? "Please wait..." : "Confirm & Continue"}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod("bank")}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                method === "bank"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Bank
            </button>
            <button
              onClick={() => setMethod("upi")}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                method === "upi"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              UPI
            </button>
          </div>

          {method === "upi" ? (
            <div className="mt-4">
              <label className="text-xs text-gray-600">UPI ID</label>
              <input
                value={upi.upiId}
                onChange={(e) => setUpi({ upiId: e.target.value })}
                placeholder="name@upi"
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Account holder name</label>
                <input
                  value={bank.accountHolderName}
                  onChange={(e) => setBank((p) => ({ ...p, accountHolderName: e.target.value }))}
                  placeholder="Full name"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Account number</label>
                <input
                  value={bank.accountNumber}
                  onChange={(e) => setBank((p) => ({ ...p, accountNumber: e.target.value }))}
                  placeholder="XXXXXXXXXXXX"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white focus:border-black/20"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">IFSC code</label>
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
                disabled={busy}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold bg-black/5 text-gray-900 hover:bg-black/10 disabled:opacity-40 transition"
              >
                Back
              </button>
            ) : null}

            <button
              onClick={handleSave}
              disabled={busy}
              className="flex-[1.4] rounded-2xl py-3 text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-40 transition inline-flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : null}
              {busy ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}