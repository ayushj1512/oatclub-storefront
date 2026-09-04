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
  Sparkles,
  Wallet,
} from "lucide-react";
/* =========================================================
  SHARED UI
========================================================= */

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
    razorpay:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles[tone] || styles.neutral
        }`}
    >
      {children}
    </span>
  );
};

/* =========================================================
  PAYMENT CARD
========================================================= */

function PayCard({
  label,
  value,
  icon,
  sub,
  selected,
  setSelected,
  badge,
  disabled = false,
  disabledMessage = "",
  prepaidOnly = false,
}) {
  const active = selected === value && !disabled;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          toast.error(
            disabledMessage || "This payment option is unavailable.",
          );
          return;
        }

        setSelected?.(value);
      }}
      aria-pressed={active}
      aria-disabled={disabled}
      className={`relative w-full border px-3 py-2.5 text-left transition sm:px-3.5 ${disabled
        ? "cursor-not-allowed border-red-200 bg-red-50 opacity-70"
        : active
          ? "border-emerald-600 bg-emerald-50"
          : "border-neutral-200 bg-[#fbfaf7] hover:border-black hover:bg-white"
        }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center border bg-white ${active
            ? "border-emerald-600 text-emerald-700"
            : "border-neutral-200 text-black"
            }`}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div
              className={`text-xs font-black uppercase tracking-[0.08em] ${disabled
                ? "text-red-700"
                : active
                  ? "text-emerald-800"
                  : "text-black"
                }`}
            >
              {label}
            </div>

            {badge}

            {active && (
              <span className="inline-flex items-center gap-1 border border-emerald-300 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Selected
              </span>
            )}
          </div>

          <div
            className={`mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.06em] ${active
              ? "text-emerald-700/80"
              : "text-black/45"
              }`}
          >
            {disabled && disabledMessage ? disabledMessage : sub}
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
  HELPERS
========================================================= */

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

/* =========================================================
  COMPONENT
========================================================= */

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
  prepaidOnly = false,

}) {
  const validationError = validate?.() || null;


  const safeWalletBalance = Math.max(
    0,
    toNumber(
      walletBalance ||
      customer?.credits?.balance ||
      0
    )
  );

  const safePayable = Math.max(
    0,
    toNumber(payable)
  );

  const appliedWalletAmount = Math.max(
    0,
    toNumber(walletAmount)
  );

  const finalPayable = safePayable;
  const hasWalletBalance = safeWalletBalance > 0;


  const COD_FEE = 59;

  const isRazorpay = selectedPayment === "razorpay";
  const isPartialCOD = selectedPayment === "partial_cod";
  const isCOD = selectedPayment === "cod";
  const isFullyPaidByWallet = finalPayable <= 0;

  const partialAmount = Math.round(finalPayable * 0.1);
  const remainingCOD = Math.max(
    0,
    finalPayable - partialAmount
  );

  const displayPayable =
    isCOD
      ? finalPayable + COD_FEE
      : finalPayable;

  const paymentLoading =
    placing || razorpayLoading;

  const disabledCTA =
    paymentLoading ||
    Boolean(validationError) ||
    (!selectedPayment && !isFullyPaidByWallet);

  /* =========================================================
    WALLET
  ========================================================= */

  const updateWalletToggle = (checked) => {
    if (
      typeof setUseWallet !== "function" ||
      typeof setWalletAmount !== "function"
    ) {
      return;
    }

    setUseWallet(checked);

    setWalletAmount(
      checked
        ? Math.min(
          safeWalletBalance,
          safePayable +
          appliedWalletAmount
        )
        : 0
    );
  };

  /* =========================================================
    PLACE ORDER
  ========================================================= */

  const handlePlaceOrder = async () => {
    const error = validate?.();

    if (error) {
      toast.error(error);
      return;
    }

    if (
      !selectedPayment &&
      !isFullyPaidByWallet
    ) {
      toast.error(
        "Please select a payment method."
      );

      setShowPayment?.(true);
      return;
    }

    if (
      typeof onPlaceOrder !== "function"
    ) {
      toast.error(
        "Unable to place order. Please refresh."
      );

      return;
    }

    const paymentMethod =
      isFullyPaidByWallet
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

  /* =========================================================
    PAYMENT CHIP
  ========================================================= */

  const getPaymentChip = () => {
    if (isFullyPaidByWallet) {
      return {
        label: "Credits",
        tone: "wallet",
      };
    }

    if (isRazorpay) {
      return {
        label:
          appliedWalletAmount > 0
            ? "Credits + Prepaid"
            : "Full Prepaid",
        tone: "razorpay",
      };
    }

    if (isPartialCOD) {
      return {
        label: "Partial COD",
        tone: "cod",
      };
    }

    if (isCOD) {
      return {
        label: "COD",
        tone: "cod",
      };
    }

    return {
      label: "Select Payment",
      tone: "neutral",
    };
  };

  /* =========================================================
    BUTTON TEXT
  ========================================================= */

  const getButtonText = () => {
    if (razorpayLoading) return "Opening Razorpay...";
    if (placing) return "Creating Order...";

    if (isFullyPaidByWallet) {
      return "Place Order Using Credits";
    }

    if (isPartialCOD) {
      return `Pay ₹${money(partialAmount)} Now`;
    }

    if (isRazorpay) {
      return `Pay ₹${money(finalPayable)} Securely`;
    }

    if (isCOD) {
      return `Place COD Order · ₹${money(displayPayable)}`;
    }

    return "Select Payment Method";
  };

  /* =========================================================
    PAYMENT MESSAGE
  ========================================================= */

  const getPaymentMessage = () => {
    if (isFullyPaidByWallet) {
      return "Your order will be fully paid using OATCLUB credits.";
    }

    if (isPartialCOD) {
      return `Pay ₹${money(partialAmount)} now and ₹${money(
        remainingCOD,
      )} on delivery. No prepaid discount applies.`;
    }

    if (isRazorpay && appliedWalletAmount > 0) {
      return "Credits will be applied first. Pay the remaining amount securely online.";
    }

    if (isRazorpay) {
      return "Pay online securely and save 5%.";
    }

    if (isCOD) {
      return `Pay ₹${money(displayPayable)} on delivery. Includes ₹59 COD fee.`;
    }

    return "Select a payment method.";
  };
  const paymentChip = getPaymentChip();

  return (
    <>
      {/* =====================================================
            PAYMENT METHOD
        ====================================================== */}

      <GlassCard className="p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() =>
            setShowPayment?.(
              (current) => !current
            )
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
            {/* Wallet Credits */}

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
                        <b>
                          ₹
                          {money(
                            safeWalletBalance
                          )}
                        </b>
                      </div>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(event) =>
                        updateWalletToggle(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-black"
                    />

                    Use Credits
                  </label>
                </div>

                {useWallet && (
                  <div className="mt-3 border border-neutral-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                      <span>
                        Credits Applied
                      </span>

                      <b className="text-black">
                        ₹
                        {money(
                          appliedWalletAmount
                        )}
                      </b>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                      <span>
                        Remaining Payable
                      </span>

                      <b className="text-black">
                        ₹{money(displayPayable)}                      </b>
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {/* CASH ON DELIVERY */}
                  <PayCard
                    label="Cash on Delivery"
                    value="cod"
                    icon={<IndianRupee className="h-5 w-5" />}
                    sub={`Pay ₹${money(finalPayable + COD_FEE)} on delivery`}
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                    disabled={prepaidOnly}
                    disabledMessage="Prepaid only for this order"
                    badge={
                      <span className="inline-flex items-center border border-neutral-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-black/60">
                        + ₹59 Fee
                      </span>
                    }
                  />
                  {/* PARTIAL COD */}
                  <PayCard
                    label="Partial COD"
                    value="partial_cod"
                    icon={<Wallet className="h-5 w-5" />}
                    disabled={prepaidOnly}
                    disabledMessage="Prepaid only for this order"
                    sub={`Pay ₹${money(partialAmount)} now · ₹${money(
                      remainingCOD,
                    )} on delivery`}
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                    badge={
                      <span className="inline-flex items-center border border-neutral-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-black/60">
                        Pay 10% Now
                      </span>
                    }
                  />

                  {/* FULL PREPAID */}
                  <PayCard
                    label="Full Online Payment"
                    value="razorpay"
                    icon={<CreditCard className="h-5 w-5" />}
                    sub="UPI / Cards / Netbanking"
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                    badge={
                      <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                        <Sparkles className="h-3 w-3" />
                        Save 5%
                      </span>
                    }
                  />
                </div>

                {/* COD UPSELL MESSAGE */}

                {isPartialCOD && (
                  <button
                    type="button"
                    onClick={() => setSelectedPayment?.("razorpay")}
                    className="mt-2.5 flex w-full items-center justify-between gap-3 border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left transition hover:bg-emerald-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-700" />

                      <div>
                        <p className="text-[11px] font-black uppercase text-emerald-900">
                          Save 5% with full payment
                        </p>

                        <p className="text-[10px] font-semibold text-emerald-700">
                          Switch to full prepaid payment
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-emerald-700" />
                  </button>
                )}

                {/* ONLINE SELECTED MESSAGE */}

                {isRazorpay && (
                  <div className="mt-2.5 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />

                    <p className="text-[10px] font-bold text-emerald-800">
                      Online payment selected —
                      you save 5%.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </GlassCard>

      {/* =====================================================
            PAYMENT SUMMARY
        ====================================================== */}

      <GlassCard className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {coupon &&
              Number(discount || 0) > 0 && (
                <div className="flex items-center justify-between gap-3 text-sm text-black">
                  <span className="truncate">
                    Coupon{" "}
                    <b>{coupon.code}</b>
                  </span>

                  <span className="shrink-0 tabular-nums">
                    − ₹{money(discount)}
                  </span>
                </div>
              )}

            {appliedWalletAmount > 0 && (
              <div className="mt-1 flex items-center justify-between gap-3 text-sm text-black">
                <span className="truncate">
                  Wallet Credits{" "}
                  <b>Applied</b>
                </span>

                <span className="shrink-0 tabular-nums">
                  − ₹
                  {money(
                    appliedWalletAmount
                  )}
                </span>
              </div>
            )}

            {isCOD && (
              <div className="mt-1 flex items-center justify-between gap-3 text-sm text-black">
                <span>COD Fee</span>

                <span className="shrink-0 tabular-nums">
                  + ₹{money(COD_FEE)}
                </span>
              </div>
            )}

            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/42">
              Total Payment
            </div>

            <div className="text-xl font-black tabular-nums text-black">
              ₹{money(displayPayable)}            </div>

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

