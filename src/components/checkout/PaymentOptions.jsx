"use client";

import toast from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  IndianRupee,
  ShieldCheck,
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
  const styles = {
    neutral: "border-neutral-200 bg-[#fbfaf7] text-black/55",
    wallet: "border-neutral-200 bg-white text-black",
    cod: "border-neutral-200 bg-white text-black",
    razorpay: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
        styles[tone] || styles.neutral
      }`}
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
  badge,
}) {
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      aria-pressed={active}
      className={`relative w-full border px-3 py-2.5 text-left transition sm:px-3.5 ${
        active
          ? "border-[#2f7d46] bg-[#edf8ef]"
          : "border-neutral-200 bg-[#fbfaf7] hover:border-black hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center border bg-white ${
            active
              ? "border-[#2f7d46] text-[#1f6a38]"
              : "border-neutral-200 text-black"
          }`}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div
              className={`text-xs font-black uppercase tracking-[0.08em] ${
                active ? "text-[#1f6a38]" : "text-black"
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
              active ? "text-[#1f6a38]/70" : "text-black/45"
            }`}
          >
            {sub}
          </div>
        </div>
      </div>
    </button>
  );
}

const money = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount.toLocaleString("en-IN")
    : "0";
};

const toNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
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

  placing = false,
  razorpayLoading = false,

  validate,
  onPlaceOrder,

  customer,
}) {
  const validationError = validate?.() || null;

  const safeWalletBalance = Math.max(
    0,
    toNumber(walletBalance || customer?.credits?.balance || 0)
  );

  const safePayable = Math.max(0, toNumber(payable));
  const appliedWalletAmount = Math.max(0, toNumber(walletAmount));

  const finalPayable = safePayable;
  const hasWalletBalance = safeWalletBalance > 0;

  const isCOD = selectedPayment === "cod";
  const isRazorpay = selectedPayment === "razorpay";
  const isFullyPaidByWallet = finalPayable <= 0;

  const paymentLoading = placing || razorpayLoading;

  const disabledCTA =
    paymentLoading ||
    Boolean(validationError) ||
    (!selectedPayment && !isFullyPaidByWallet);

  const updateWalletToggle = (checked) => {
    if (typeof setUseWallet !== "function") return;
    if (typeof setWalletAmount !== "function") return;

    setUseWallet(checked);

    setWalletAmount(
      checked ? Math.min(safeWalletBalance, safePayable) : 0
    );
  };

  const handlePlaceOrder = async () => {
    const error = validate?.();

    if (error) {
      toast.error(error);
      return;
    }

    if (!selectedPayment && !isFullyPaidByWallet) {
      toast.error("Please select a payment method.");
      setShowPayment?.(true);
      return;
    }

    if (typeof onPlaceOrder !== "function") {
      toast.error("Unable to place order. Please refresh.");
      return;
    }

    const paymentMethod = isFullyPaidByWallet
      ? "wallet"
      : selectedPayment;

    await onPlaceOrder({
      paymentMethod,
      payableAmount: finalPayable,
      walletAmount: appliedWalletAmount,
      useWallet: appliedWalletAmount > 0,
      couponCode: coupon?.code || null,
    });
  };

  const getPaymentChip = () => {
    if (isFullyPaidByWallet) {
      return {
        label: "Credits",
        tone: "wallet",
      };
    }

    if (isRazorpay && appliedWalletAmount > 0) {
      return {
        label: "Credits + Online",
        tone: "razorpay",
      };
    }

    if (isCOD && appliedWalletAmount > 0) {
      return {
        label: "Credits + COD",
        tone: "cod",
      };
    }

    if (isRazorpay) {
      return {
        label: "Razorpay",
        tone: "razorpay",
      };
    }

    return {
      label: "COD",
      tone: "cod",
    };
  };

  const getButtonText = () => {
    if (razorpayLoading) {
      return "Opening Razorpay...";
    }

    if (placing) {
      return "Creating Order...";
    }

    if (isFullyPaidByWallet) {
      return "Place Order Using Credits";
    }

    if (isRazorpay) {
      return `Pay ₹${money(finalPayable)} Securely`;
    }

    if (appliedWalletAmount > 0) {
      return "Place Order (Credits + COD)";
    }

    return "Place Order (COD)";
  };

  const getPaymentMessage = () => {
    if (isFullyPaidByWallet) {
      return "Your order will be fully paid using OATCLUB credits.";
    }

    if (isRazorpay && appliedWalletAmount > 0) {
      return "Credits will be applied first. Pay the remaining amount securely through Razorpay.";
    }

    if (isRazorpay) {
      return "Secure payment through Razorpay using UPI, cards, netbanking or supported wallets.";
    }

    if (appliedWalletAmount > 0) {
      return "Credits will be applied first. Pay the remaining amount when your order is delivered.";
    }

    return "Pay when your order is delivered.";
  };

  const paymentChip = getPaymentChip();

  return (
    <>
      <GlassCard className="p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() =>
            setShowPayment?.((current) => !current)
          }
          className="flex w-full items-center justify-between"
        >
          <div className="min-w-0 text-left">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">
              Step 3
            </div>

            <div className="text-sm font-black uppercase tracking-[0.08em] text-black">
              Payment Method
            </div>
          </div>

          {showPayment ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
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
                        OATCLUB Credits
                      </div>

                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/50">
                        Available Balance:{" "}
                        <b>₹{money(safeWalletBalance)}</b>
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
                  <div className="mt-3 border border-neutral-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                      <span>Credits Applied</span>

                      <b className="text-black">
                        ₹{money(appliedWalletAmount)}
                      </b>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                      <span>Remaining Payable</span>

                      <b className="text-black">
                        ₹{money(finalPayable)}
                      </b>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isFullyPaidByWallet && (
              <>
                <div className="mb-2.5 flex items-center justify-between gap-3 border border-neutral-200 bg-[#fbfaf7] px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black">
                    Choose Payment
                  </span>

                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-black/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure Checkout
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <PayCard
                    label="Cash on Delivery"
                    value="cod"
                    icon={<Wallet className="h-5 w-5" />}
                    sub={
                      appliedWalletAmount > 0
                        ? `Pay ₹${money(finalPayable)} on delivery`
                        : "Pay when your order arrives"
                    }
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                  />

                  <PayCard
                    label="Online Payment"
                    value="razorpay"
                    icon={<CreditCard className="h-5 w-5" />}
                    sub="UPI / Cards / Netbanking"
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                    badge={
                      <span className="inline-flex items-center border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-blue-700">
                        Razorpay
                      </span>
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {coupon && Number(discount || 0) > 0 && (
              <div className="flex items-center justify-between gap-3 text-sm text-black">
                <span className="truncate">
                  Coupon <b>{coupon.code}</b>
                </span>

                <span className="shrink-0 tabular-nums">
                  − ₹{money(discount)}
                </span>
              </div>
            )}

            {appliedWalletAmount > 0 && (
              <div className="mt-1 flex items-center justify-between gap-3 text-sm text-black">
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
              Shipping:{" "}
              <span className="font-black text-black">
                Free
              </span>
            </div>
          </div>

          <Chip tone={paymentChip.tone}>
            <IndianRupee className="h-3.5 w-3.5" />
            {paymentChip.label}
          </Chip>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={disabledCTA}
          className="mt-3 flex h-11 w-full items-center justify-center bg-black px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/40"
        >
          {getButtonText()}

          <ArrowRight className="ml-2 h-4 w-4" />
        </button>

        {validationError ? (
          <p className="mt-2 text-center text-[11px] text-red-600">
            {validationError}
          </p>
        ) : (
          <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-500">
            {getPaymentMessage()}
          </p>
        )}
      </GlassCard>
    </>
  );
}