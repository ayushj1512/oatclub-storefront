// src/components/profile/PayoutDetailsCard.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Landmark,
  CreditCard,
  Hash,
  BadgeCheck,
  Save,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";

const digitsOnly = (s) => String(s || "").replace(/\D/g, "");
const upper = (s) => String(s || "").trim().toUpperCase();
const lower = (s) => String(s || "").trim().toLowerCase();

function Notice({ notice, onClose }) {
  if (!notice?.text) return null;

  const isErr = notice.type === "error";
  return (
    <div
      className={`mt-4 p-3 border text-sm flex items-start justify-between gap-3 ${
        isErr
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      <div className="flex items-start gap-2">
        {isErr ? (
          <AlertTriangle size={16} className="mt-0.5" />
        ) : (
          <CheckCircle2 size={16} className="mt-0.5" />
        )}
        <div>{notice.text}</div>
      </div>
      <button
        onClick={onClose}
        className="text-xs underline opacity-90 hover:opacity-100"
      >
        Close
      </button>
    </div>
  );
}

/**
 * ✅ RefundDetailsCard (PayoutDetailsCard)
 * ✅ Copy updated: "refunds only"
 * - Uses store action: updateCustomerPayoutDetails(payload)
 * - Allows saving either:
 *   - Complete bank details (name + account + IFSC), OR
 *   - UPI ID
 * - Optional: user can fill both
 */
export default function PayoutDetailsCard({
  title = "Refund Details",
}) {
  const customer = useAuthStore((s) => s.customer);
  const updateCustomerPayoutDetails = useAuthStore(
    (s) => s.updateCustomerPayoutDetails
  );

  const existing = useMemo(() => customer?.payoutDetails || {}, [customer]);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  // snapshot for reset + change detection
  const [initial, setInitial] = useState(form);

  useEffect(() => {
    const next = {
      accountHolderName: existing?.bank?.accountHolderName || "",
      accountNumber: existing?.bank?.accountNumber || "",
      ifscCode: existing?.bank?.ifscCode || "",
      upiId: existing?.upi?.upiId || "",
    };
    setForm(next);
    setInitial(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    existing?.bank?.accountHolderName,
    existing?.bank?.accountNumber,
    existing?.bank?.ifscCode,
    existing?.upi?.upiId,
  ]);

  const updatedAt = existing?.updatedAt ? new Date(existing.updatedAt) : null;

  const changed = useMemo(() => {
    return (
      String(form.accountHolderName || "") !==
        String(initial.accountHolderName || "") ||
      String(form.accountNumber || "") !==
        String(initial.accountNumber || "") ||
      String(form.ifscCode || "") !== String(initial.ifscCode || "") ||
      String(form.upiId || "") !== String(initial.upiId || "")
    );
  }, [form, initial]);

  const hasAnyBank = useMemo(() => {
    const name = String(form.accountHolderName || "").trim();
    const acc = String(form.accountNumber || "").trim();
    const ifsc = String(form.ifscCode || "").trim();
    return !!(name || acc || ifsc);
  }, [form.accountHolderName, form.accountNumber, form.ifscCode]);

  const hasUpi = useMemo(
    () => !!String(form.upiId || "").trim(),
    [form.upiId]
  );

  const fieldErrors = useMemo(() => {
    const name = String(form.accountHolderName || "").trim();
    const acc = String(form.accountNumber || "").trim();
    const ifsc = upper(form.ifscCode);
    const upi = lower(form.upiId);

    const errs = {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      general: "",
    };

    if (!hasAnyBank && !hasUpi) {
      errs.general = "Please add UPI ID or complete bank details for refunds.";
      return errs;
    }

    if (hasAnyBank) {
      if (!name || name.length < 2) errs.accountHolderName = "Required";
      if (!acc || acc.length < 6) errs.accountNumber = "Invalid account number";
      if (!ifsc || ifsc.length < 8) errs.ifscCode = "Invalid IFSC";
    }

    if (hasUpi && !upi.includes("@")) errs.upiId = "UPI should look like name@bank";

    return errs;
  }, [form, hasAnyBank, hasUpi]);

  const canSave = useMemo(() => {
    if (!changed) return false;
    if (fieldErrors.general) return false;
    if (
      fieldErrors.accountHolderName ||
      fieldErrors.accountNumber ||
      fieldErrors.ifscCode ||
      fieldErrors.upiId
    )
      return false;
    return true;
  }, [changed, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotice({ type: "", text: "" });

    if (name === "accountNumber") {
      setForm((p) => ({ ...p, accountNumber: digitsOnly(value).slice(0, 20) }));
      return;
    }
    if (name === "ifscCode") {
      setForm((p) => ({ ...p, ifscCode: upper(value).slice(0, 11) }));
      return;
    }
    if (name === "upiId") {
      setForm((p) => ({ ...p, upiId: lower(value).slice(0, 80) }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleReset = () => {
    setNotice({ type: "", text: "" });
    setForm(initial);
  };

  const handleSave = async () => {
    setNotice({ type: "", text: "" });

    if (!customer?._id) {
      setNotice({ type: "error", text: "Customer not loaded yet." });
      return;
    }

    if (typeof updateCustomerPayoutDetails !== "function") {
      setNotice({
        type: "error",
        text: "updateCustomerPayoutDetails not found in authStore.",
      });
      return;
    }

    if (!canSave) {
      const msg =
        fieldErrors.general ||
        fieldErrors.accountHolderName ||
        fieldErrors.accountNumber ||
        fieldErrors.ifscCode ||
        fieldErrors.upiId ||
        (!changed ? "No changes to save." : "Please fix the errors above.");
      setNotice({ type: "error", text: msg });
      return;
    }

    const payload = {};
    const name = String(form.accountHolderName || "").trim();
    const acc = String(form.accountNumber || "").trim();
    const ifsc = upper(form.ifscCode);
    const upi = lower(form.upiId);

    if (hasAnyBank) {
      payload.bank = { accountHolderName: name, accountNumber: acc, ifscCode: ifsc };
    }
    if (hasUpi) {
      payload.upi = { upiId: upi };
    }

    setSaving(true);
    const ok = await updateCustomerPayoutDetails(payload);
    setSaving(false);

    if (!ok) {
      setNotice({ type: "error", text: "Save failed. Please try again." });
      return;
    }

    const nextInitial = {
      ...form,
      ifscCode: upper(form.ifscCode),
      upiId: lower(form.upiId),
    };
    setInitial(nextInitial);
    setForm(nextInitial);

    setNotice({ type: "success", text: "Refund details saved successfully!" });
  };

  return (
    <div className="bg-white shadow-lg border border-gray-200 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            We use these details <span className="font-medium">only for refunds</span>.
          </p>

          {updatedAt ? (
            <div className="text-xs text-gray-400 mt-2">
              Last updated: {updatedAt.toLocaleString("en-IN")}
            </div>
          ) : null}

          {changed ? (
            <div className="mt-3 inline-flex items-center gap-2 text-xs border border-amber-200 bg-amber-50 text-amber-800 px-2.5 py-1">
              <AlertTriangle size={14} />
              Unsaved changes
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 text-xs border border-gray-200 bg-gray-50 text-gray-700 px-2.5 py-1">
              <BadgeCheck size={14} />
              Up to date
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!changed || saving}
            className="px-4 py-3 text-sm border border-gray-300 bg-white shadow-sm hover:shadow-md transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Reset changes"
          >
            <XCircle size={16} />
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="px-5 py-3 text-sm bg-black text-white shadow-md hover:bg-gray-900 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            title={!changed ? "No changes" : !canSave ? "Fix errors" : "Save"}
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {fieldErrors.general ? (
        <div className="mt-4 text-xs text-red-600 flex items-center gap-2">
          <AlertTriangle size={14} />
          {fieldErrors.general}
        </div>
      ) : null}

      <Notice notice={notice} onClose={() => setNotice({ type: "", text: "" })} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank */}
        <div className="border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Landmark size={16} />
            Bank (for refunds)
          </div>
          <div className="text-xs text-gray-500 mt-1">
            If you fill bank, then Name + Account No + IFSC are required.
          </div>

          <div className="mt-4 space-y-4">
            <Field
              icon={<CreditCard size={16} className="text-gray-700" />}
              label="Account Holder Name"
              name="accountHolderName"
              value={form.accountHolderName}
              onChange={handleChange}
              placeholder="Full name as per bank"
              error={fieldErrors.accountHolderName}
            />
            <Field
              icon={<Hash size={16} className="text-gray-700" />}
              label="Account Number"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="Digits only"
              inputMode="numeric"
              error={fieldErrors.accountNumber}
            />
            <Field
              icon={<BadgeCheck size={16} className="text-gray-700" />}
              label="IFSC Code"
              name="ifscCode"
              value={form.ifscCode}
              onChange={handleChange}
              placeholder="e.g. HDFC0001234"
              autoCapitalize="characters"
              error={fieldErrors.ifscCode}
            />
          </div>
        </div>

        {/* UPI */}
        <div className="border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <BadgeCheck size={16} />
            UPI (for refunds)
          </div>
          <div className="text-xs text-gray-500 mt-1">
            UPI ID example: <span className="font-medium">name@paytm</span>
          </div>

          <div className="mt-4 space-y-4">
            <Field
              icon={<BadgeCheck size={16} className="text-gray-700" />}
              label="UPI ID"
              name="upiId"
              value={form.upiId}
              onChange={handleChange}
              placeholder="yourname@bank"
              inputMode="text"
              error={fieldErrors.upiId}
            />
          </div>
        </div>
      </div>

      {/* ✅ Refund-only copy */}
      <div className="mt-5 text-xs text-gray-500 flex items-start gap-2">
        <ShieldCheck size={14} className="mt-0.5 text-gray-600" />
        We use these details only to process{" "}
        <span className="font-medium">refunds</span>. They are not used for
        purchases or auto-debits.
      </div>
    </div>
  );
}

/* ------------------------------ */
/* Field */
/* ------------------------------ */
function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon = null,
  inputMode,
  hint,
  autoCapitalize,
  error,
}) {
  return (
    <div className="space-y-2">
      <label className="text-gray-700 text-sm">{label}</label>
      <div
        className={`flex items-center gap-2 border bg-white shadow-sm px-3 py-2.5 ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      >
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      {error ? (
        <div className="text-xs text-red-600 flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      ) : hint ? (
        <div className="text-xs text-gray-500">{hint}</div>
      ) : null}
    </div>
  );
}