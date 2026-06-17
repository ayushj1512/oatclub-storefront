"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";

const ORDER_PREFIX = "OATCLUB-";

function normalizeOrderSuffix(value = "") {
  return String(value).replace(/[^0-9]/g, "").trim();
}

function normalizeIdentity(value = "") {
  return String(value).trim().toLowerCase();
}

export default function OrderLookupForm({ loading, error, onSubmit }) {
  const [orderSuffix, setOrderSuffix] = useState("");
  const [identity, setIdentity] = useState("");

  const normalizedOrderSuffix = normalizeOrderSuffix(orderSuffix);
  const normalizedIdentity = normalizeIdentity(identity);

  const orderNumber = useMemo(() => {
    return `${ORDER_PREFIX}${normalizedOrderSuffix}`;
  }, [normalizedOrderSuffix]);

  const canSubmit = Boolean(normalizedOrderSuffix && normalizedIdentity);

  const handleSubmit = () => {
    if (!canSubmit || loading) return;

    onSubmit({
      orderNumber,
      identity: normalizedIdentity,
    });
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
          <Search className="h-5 w-5 text-gray-700" />
        </div>

        <div>
          <h2 className="text-base font-semibold">Verify your order</h2>
          <p className="text-sm text-gray-500">
            Enter your OATCLUB order number with mobile or email.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex h-12 items-center overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-100 focus-within:bg-white focus-within:ring-gray-300">
          <span className="px-4 text-sm font-medium text-gray-500">
            {ORDER_PREFIX}
          </span>

          <input
            value={orderSuffix}
            onChange={(e) => setOrderSuffix(normalizeOrderSuffix(e.target.value))}
            placeholder="004312"
            inputMode="numeric"
            className="h-full w-full bg-transparent pr-4 text-sm outline-none"
          />
        </div>

        <input
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="Mobile number or email"
          className="h-12 rounded-2xl bg-gray-50 px-4 text-sm outline-none ring-1 ring-gray-100 transition focus:bg-white focus:ring-gray-300"
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canSubmit || loading}
        onClick={handleSubmit}
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Verify Order
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}