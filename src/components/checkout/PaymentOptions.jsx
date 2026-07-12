"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Wallet,
} from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`border border-neutral-200 bg-white shadow-[0_14px_38px_rgba(30,25,18,0.04)] ${className}`}
  >
    {children}
  </div>
);

const Chip = ({ children, tone = "neutral" }) => {
  const toneClass =
    tone === "wallet"
      ? "border border-neutral-200 bg-white text-black"
      : "border border-neutral-200 bg-[#fbfaf7] text-black/55";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${toneClass}`}
    >
      {children}
    </span>
  );
};

function PayCard({
  label,
  value,
  icon,
  sub,
  selected,
  setSelected,
  badge = null,
  disabled = false,
}) {
  const active = !disabled && selected === value;

  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) setSelected(value);
      }}
      aria-pressed={active}
      aria-disabled={disabled}
      disabled={disabled}
      className={`relative w-full border px-3 py-2.5 text-left transition sm:px-3.5 ${
        disabled
          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-70"
          : active
          ? "border-[#2f7d46] bg-[#edf8ef]"
          : "border-neutral-200 bg-[#fbfaf7] hover:border-black hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-9 shrink-0 place-items-center border bg-white ${
              disabled
                ? "border-neutral-200 text-black/35"
                : active
                ? "border-[#2f7d46] text-[#1f6a38]"
                : "border-neutral-200 text-black"
            }`}
          >
            {icon}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <div
                className={`text-xs font-black uppercase tracking-[0.08em] ${
                  disabled
                    ? "text-black/40"
                    : active
                    ? "text-[#1f6a38]"
                    : "text-black"
                }`}
              >
                {label}
              </div>

              {badge}

              {active && (
                <span className="inline-flex items-center gap-1 border border-[#2f7d46]/30 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#1f6a38]">
                  <CheckCircle2 className="h-3 w-3" />
                  Selected
                </span>
              )}
            </div>

            <div
              className={`mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.06em] ${
                disabled
                  ? "text-black/30"
                  : active
                  ? "text-[#1f6a38]/70"
                  : "text-black/45"
              }`}
            >
              {sub}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

const money = (value) =>
  Number.isFinite(Number(value))
    ? Number(value).toLocaleString("en-IN")
    : "0";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default function PaymentOptions({
  showPayment,
  setShowPayment,
  selectedPayment,
  setSelectedPayment,
  payable,
  useWallet = false,
  setUseWallet,
  walletAmount = 0,
  setWalletAmount,
  walletBalance = 0,
  coupon,
  discount,
  placing,
  validate,
  onPlaceOrder,
  customer,
}) {
  const validationError = validate?.() || null;
  const disabledCTA = placing || Boolean(validationError);

  const safeWalletBalance = Math.max(
    0,
    toNumber(walletBalance || customer?.credits?.balance || 0)
  );

  const safePayable = Math.max(0, toNumber(payable));
  const appliedWalletAmount = Math.max(0, toNumber(walletAmount));
  const hasWalletBalance = safeWalletBalance > 0;
  const finalPayable = safePayable;

  useEffect(() => {
    if (String(selectedPayment || "").toLowerCase() !== "cod") {
      setSelectedPayment("cod");
    }
  }, [selectedPayment, setSelectedPayment]);

  const updateWalletToggle = (checked) => {
    if (!setUseWallet || !setWalletAmount) return;

    setUseWallet(checked);
    setWalletAmount(
      checked ? Math.min(safeWalletBalance, safePayable) : 0
    );
  };

  const placeNormalOrder = () => {
    const error = validate?.();

    if (error) {
      toast.error(error);
      return;
    }

    if (typeof onPlaceOrder !== "function") {
      toast.error("Unable to place order. Please refresh.");
      return;
    }

    onPlaceOrder();
  };

  return (
    <>
      <GlassCard className="p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() => setShowPayment((current) => !current)}
          className="flex w-full items-center justify-between"
        >
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">
              Step 3
            </div>
            <div className="text-sm font-black uppercase tracking-[0.08em] text-black">
              Payment Method
            </div>
          </div>

          {showPayment ? <ChevronUp /> : <ChevronDown />}
        </button>

        {showPayment && (
          <div className="pt-3">
            {hasWalletBalance && (
              <div className="mb-3 border border-neutral-200 bg-[#fbfaf7] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center border border-neutral-200 bg-white text-black">
                      <Wallet className="h-5 w-5" />
                    </span>

                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.08em] text-black">
                        OATCLUB Credits Available
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/50">
                        Balance: <b>₹{money(safeWalletBalance)}</b>
                      </div>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(event) =>
                        updateWalletToggle(event.target.checked)
                      }
                      className="h-4 w-4 accent-black"
                    />
                    Use Credits
                  </label>
                </div>

                {useWallet && (
                  <div className="mt-4 border border-neutral-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                    Credits Applied: <b>₹{money(appliedWalletAmount)}</b>
                    {" • "}
                    Remaining Payable: <b>₹{money(finalPayable)}</b>
                  </div>
                )}
              </div>
            )}

            <div className="mb-2.5 flex items-center justify-between gap-3 border border-neutral-200 bg-[#fbfaf7] px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black">
                Choose Your Payment
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-black/40">
                Offline Selected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PayCard
                label="Offline / COD"
                value="cod"
                icon={<Wallet className="h-5 w-5" />}
                sub={
                  appliedWalletAmount > 0
                    ? `Pay ₹${money(finalPayable)} on delivery`
                    : "Pay when your order arrives"
                }
                selected="cod"
                setSelected={setSelectedPayment}
              />

              <PayCard
                label="Online Payment"
                value="razorpay"
                icon={<IndianRupee className="h-5 w-5" />}
                sub="UPI / Cards / Netbanking"
                selected="cod"
                setSelected={setSelectedPayment}
                disabled
                badge={
                  <span className="inline-flex items-center border border-black/10 bg-black px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                    Coming Soon
                  </span>
                }
              />
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {coupon && Number(discount || 0) > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-black">
                <span className="truncate">
                  Coupon <b>{coupon.code}</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(discount)}
                </span>
              </div>
            )}

            {appliedWalletAmount > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-black">
                <span className="truncate">
                  Wallet Credits <b>Applied</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(appliedWalletAmount)}
                </span>
              </div>
            )}

            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/42">
              Total Payment
            </div>
            <div className="text-xl font-black tabular-nums text-black">
              ₹{money(finalPayable)}
            </div>

            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
              Shipping: <span className="font-black text-black">Free</span>
            </div>
          </div>

          <Chip tone={appliedWalletAmount > 0 ? "wallet" : "neutral"}>
            <IndianRupee className="h-3.5 w-3.5" />
            {finalPayable === 0
              ? "Credits"
              : appliedWalletAmount > 0
              ? "Credits + COD"
              : "COD"}
          </Chip>
        </div>

        <button
          type="button"
          onClick={placeNormalOrder}
          disabled={disabledCTA}
          className="mt-3 h-11 w-full bg-black text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 disabled:bg-black/20 disabled:text-black/40"
        >
          {placing
            ? "Placing..."
            : finalPayable === 0
            ? "Place Order (Credits)"
            : appliedWalletAmount > 0
            ? "Place Order (Credits + COD)"
            : "Place Order (COD)"}
          <ArrowRight className="ml-2 inline-block h-4 w-4" />
        </button>

        {validationError ? (
          <p className="mt-2 text-center text-[11px] text-red-600">
            {validationError}
          </p>
        ) : (
          <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-500">
            {finalPayable === 0
              ? "Your order will be fully paid using OATCLUB credits."
              : appliedWalletAmount > 0
              ? "Credits will be used first. The remaining amount will be paid on delivery."
              : "You’ll pay when the order is delivered."}
          </p>
        )}
      </GlassCard>
    </>
  );
}