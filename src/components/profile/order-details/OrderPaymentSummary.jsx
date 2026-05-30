"use client";

import {
  ReceiptText,
  Wallet,
  CreditCard,
  BadgeIndianRupee,
  ChevronDown,
} from "lucide-react";

import { money, prettyStatus } from "./orderDetailsUtils";

function SummaryRow({ label, value, strong = false, danger = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-xs">
      <span className={strong ? "font-bold text-gray-950" : "text-gray-500"}>
        {label}
      </span>

      <span
        className={
          strong
            ? "text-sm font-black text-gray-950"
            : danger
            ? "font-bold text-red-600"
            : "font-bold text-gray-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

function MiniPill({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2">
      <Icon size={13} className="shrink-0 text-gray-500" />
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/35">
          {label}
        </p>
        <p className="truncate text-xs font-black text-gray-950">{value}</p>
      </div>
    </div>
  );
}

export default function OrderPaymentSummary({ order }) {
  const walletAmount =
    order?.paymentBreakdown?.walletAmount || order?.walletCredit?.amount || 0;

  const razorpayAmount =
    order?.paymentBreakdown?.razorpayAmount || order?.razorpay?.amount || 0;

  const codAmount = order?.paymentBreakdown?.codAmount || 0;

  const finalPayable = order?.finalPayable ?? order?.totalAmount ?? 0;

  const hasWallet = Number(walletAmount) > 0;
  const hasOnline = Number(razorpayAmount) > 0;
  const hasCod = Number(codAmount) > 0;

  return (
    <details className="group rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.04]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-black text-white">
            <ReceiptText size={15} />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
              Payment
            </p>
            <h2 className="truncate text-base font-black text-gray-950">
              Bill Summary
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-500">Payable</p>
            <p className="text-sm font-black text-gray-950">
              ₹{money(finalPayable)}
            </p>
          </div>

          <ChevronDown
            size={17}
            className="text-gray-400 transition group-open:rotate-180"
          />
        </div>
      </summary>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <MiniPill
            icon={CreditCard}
            label="Method"
            value={prettyStatus(order?.paymentMethod)}
          />

          <MiniPill
            icon={BadgeIndianRupee}
            label="Status"
            value={prettyStatus(order?.paymentStatus)}
          />

          <MiniPill
            icon={Wallet}
            label="Wallet"
            value={hasWallet ? `₹${money(walletAmount)}` : "Not used"}
          />
        </div>

        <div className="mt-3 rounded-3xl bg-gray-50 px-4 py-3">
          <SummaryRow label="Subtotal" value={`₹${money(order?.subtotal)}`} />

          {Number(order?.discount) > 0 ? (
            <SummaryRow
              label="Discount"
              value={`- ₹${money(order?.discount)}`}
              danger
            />
          ) : null}

          {Number(order?.shippingFee) > 0 ? (
            <SummaryRow
              label="Shipping"
              value={`₹${money(order?.shippingFee)}`}
            />
          ) : null}

          {Number(order?.tax) > 0 ? (
            <SummaryRow label="Tax" value={`₹${money(order?.tax)}`} />
          ) : null}

          {hasWallet ? (
            <SummaryRow
              label="Wallet Used"
              value={`- ₹${money(walletAmount)}`}
              danger
            />
          ) : null}

          {(hasOnline || hasCod) ? (
            <>
              <div className="my-1.5 border-t border-black/5" />

              {hasOnline ? (
                <SummaryRow
                  label="Razorpay"
                  value={`₹${money(razorpayAmount)}`}
                />
              ) : null}

              {hasCod ? (
                <SummaryRow label="COD" value={`₹${money(codAmount)}`} />
              ) : null}
            </>
          ) : null}

          <div className="my-1.5 border-t border-black/5" />

          <SummaryRow
            label="Final Payable"
            value={`₹${money(finalPayable)}`}
            strong
          />
        </div>
      </div>
    </details>
  );
}