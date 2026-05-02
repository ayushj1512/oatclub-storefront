"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Loader2,
  Pencil,
} from "lucide-react";
import useCustomerStore from "@/store/customerStore";

const initialBank = {
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return "";
};

export default function RefundDetailsStep({
  customerId,
  customerEmail = "",
  customerPhone = "",
  onBack,
  onContinue,
}) {
  const {
    customer,
    payoutDetails,
    fetchCustomerById,
    checkCustomerExists,
    savePayoutDetails,
    saving,
    loading,
  } = useCustomerStore();

  const [resolvedCustomerId, setResolvedCustomerId] = useState(
    getId(customerId)
  );
  const [resolving, setResolving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bank, setBank] = useState(initialBank);
  const [error, setError] = useState("");

  const finalCustomerId =
    resolvedCustomerId || getId(customerId) || getId(customer);

  useEffect(() => {
    const resolveCustomer = async () => {
      setError("");

      const directId = getId(customerId);

      if (directId) {
        setResolvedCustomerId(directId);
        await fetchCustomerById(directId);
        return;
      }

      if (!customerEmail && !customerPhone) {
        setError("Please verify your order with mobile number or email.");
        return;
      }

      try {
        setResolving(true);

        const data = await checkCustomerExists({
          email: customerEmail || "",
          phone: customerPhone || "",
        });

        const foundId = getId(data?.customer);

        if (foundId) {
          setResolvedCustomerId(foundId);
          await fetchCustomerById(foundId);
        } else {
          setError("No customer account found with this order contact detail.");
        }
      } catch (err) {
        setError(err?.message || "Unable to find customer account.");
      } finally {
        setResolving(false);
      }
    };

    resolveCustomer();
  }, [
    customerId,
    customerEmail,
    customerPhone,
    fetchCustomerById,
    checkCustomerExists,
  ]);

  useEffect(() => {
    const savedBank = payoutDetails?.bank || {};

    setBank({
      accountHolderName: savedBank?.accountHolderName || "",
      accountNumber: savedBank?.accountNumber || "",
      ifscCode: savedBank?.ifscCode || "",
    });
  }, [payoutDetails]);

  const hasBank = useMemo(
    () =>
      payoutDetails?.bank?.accountHolderName &&
      payoutDetails?.bank?.accountNumber &&
      payoutDetails?.bank?.ifscCode,
    [payoutDetails]
  );

  useEffect(() => {
    if (!hasBank) setEditing(true);
  }, [hasBank]);

  const validate = () => {
    if (!finalCustomerId) {
      return "Customer account is still loading. Please try again.";
    }

    if (!bank.accountHolderName.trim()) {
      return "Please enter account holder name.";
    }

    if (!bank.accountNumber.trim()) {
      return "Please enter account number.";
    }

    if (!bank.ifscCode.trim()) {
      return "Please enter IFSC code.";
    }

    return "";
  };

  const handleSave = async () => {
    setError("");

    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    try {
      await savePayoutDetails(finalCustomerId, {
        bank: {
          accountHolderName: bank.accountHolderName.trim(),
          accountNumber: bank.accountNumber.trim(),
          ifscCode: bank.ifscCode.trim().toUpperCase(),
        },
      });

      onContinue?.();
    } catch (err) {
      setError(err?.message || "Unable to save refund details.");
    }
  };

  if (loading || resolving) {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading refund details...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
          <CreditCard className="h-5 w-5 text-gray-800" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-950">
            Refund account details
          </h2>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            Add bank details now, or skip and our team will contact you before
            processing the refund.
          </p>

          {customerEmail || customerPhone ? (
            <p className="mt-2 text-xs text-gray-400">
              Verified with {customerEmail || customerPhone}
            </p>
          ) : null}
        </div>
      </div>

      {hasBank && !editing ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Saved bank account
            </p>

            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium text-gray-950">
                {payoutDetails.bank.accountHolderName}
              </p>

              <p className="text-gray-500">
                A/C ending ••••
                {String(payoutDetails.bank.accountNumber).slice(-4)}
              </p>

              <p className="text-gray-500">
                IFSC: {payoutDetails.bank.ifscCode}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onContinue}
              className="h-11 rounded-2xl bg-gray-950 text-sm font-medium text-white"
            >
              Use this account
            </button>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-100 text-sm font-medium text-gray-800"
            >
              <Pencil className="h-4 w-4" />
              Edit account
            </button>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="h-11 w-full rounded-2xl bg-white text-sm font-medium text-gray-500 ring-1 ring-gray-100 transition hover:text-gray-950"
          >
            Skip for now
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-3">
            <input
              value={bank.accountHolderName}
              onChange={(e) =>
                setBank((p) => ({
                  ...p,
                  accountHolderName: e.target.value,
                }))
              }
              placeholder="Account holder name"
              className="h-12 w-full rounded-2xl bg-gray-50 px-4 text-sm outline-none ring-1 ring-gray-100 focus:bg-white focus:ring-gray-300"
            />

            <input
              value={bank.accountNumber}
              onChange={(e) =>
                setBank((p) => ({
                  ...p,
                  accountNumber: e.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="Account number"
              inputMode="numeric"
              className="h-12 w-full rounded-2xl bg-gray-50 px-4 text-sm outline-none ring-1 ring-gray-100 focus:bg-white focus:ring-gray-300"
            />

            <input
              value={bank.ifscCode}
              onChange={(e) =>
                setBank((p) => ({
                  ...p,
                  ifscCode: e.target.value.toUpperCase(),
                }))
              }
              placeholder="IFSC code"
              className="h-12 w-full rounded-2xl bg-gray-50 px-4 text-sm uppercase outline-none ring-1 ring-gray-100 focus:bg-white focus:ring-gray-300"
            />
          </div>

          {error ? (
            <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              disabled={saving || !finalCustomerId}
              onClick={handleSave}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save and continue
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="h-11 w-full rounded-2xl bg-gray-100 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}