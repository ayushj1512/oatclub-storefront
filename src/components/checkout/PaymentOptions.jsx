"use client";

import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Wallet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import RazorpayCheckoutButton from "@/components/checkout/RazorpayCheckoutButton";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`border border-neutral-200 bg-white shadow-[0_14px_38px_rgba(30,25,18,0.04)] ${className}`}
  >
    {children}
  </div>
);

const Chip = ({ children, tone = "neutral" }) => {
  const toneCls =
    tone === "success"
      ? "border border-[#2f7d46] bg-[#edf8ef] text-[#1f6a38]"
      : tone === "wallet"
      ? "bg-white text-black border border-neutral-200"
      : "bg-[#fbfaf7] text-black/55 border border-neutral-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${toneCls}`}
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
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) setSelected(value);
      }}
      aria-pressed={active}
      disabled={disabled}
      className={`relative w-full border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5 ${
        active
          ? "border-[#2f7d46] bg-[#edf8ef]"
          : "border-neutral-200 bg-[#fbfaf7] hover:border-black hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-9 shrink-0 place-items-center border bg-white ${
              active ? "border-[#2f7d46] text-[#1f6a38]" : "border-neutral-200 text-black"
            }`}
          >
            {icon}
          </span>

          <div className="min-w-0">
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

      </div>
    </button>
  );
}

const money = (n) =>
  Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function PaymentOptions({
  showPayment,
  setShowPayment,

  selectedPayment,
  setSelectedPayment,

  payable,
  subtotal = 0,
  razorpayExtraDiscount = 0,

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
  selectedAddressObj,
  user,
  customer,

  ensureGuestCustomer,
  createOrder,
  getCheckoutPayload,
}) {
  const validationError = validate?.() || null;
  const disabledCTA = placing || !!validationError;

  const isOnline = String(selectedPayment).toLowerCase() === "razorpay";
  const isCOD = String(selectedPayment).toLowerCase() === "cod";

  const safeWalletBalance = Math.max(
    0,
    toNum(walletBalance || customer?.credits?.balance || 0)
  );

const safePayableBeforeWallet = Math.max(0, toNum(payable));

  const hasWalletBalance = safeWalletBalance > 0;

  const appliedWalletAmount = Math.max(0, toNum(walletAmount || 0));


 const remainingAfterWallet = safePayableBeforeWallet;

// ✅ already discounted amount comes from checkout page
const safeExtra = Math.max(0, toNum(razorpayExtraDiscount));

const showExtra = isOnline && safeExtra > 0;

// ✅ DON'T subtract again
const finalPayable = Math.max(0, remainingAfterWallet);

  const updateWalletToggle = (checked) => {
    if (!setUseWallet || !setWalletAmount) return;

    setUseWallet(checked);

    if (checked) {
      setWalletAmount(Math.min(safeWalletBalance, safePayableBeforeWallet));
    } else {
      setWalletAmount(0);
    }
  };

  const handleSelectPayment = (value) => {
    setSelectedPayment(value);
  };

  const getWalletPayload = () => ({
    useWallet: appliedWalletAmount > 0,
    walletAmount: appliedWalletAmount,
  });

  const createRazorpayOrder = async () => {
    const err = validate?.();
    if (err) {
      toast.error(err);
      return null;
    }

    if (user?.uid && !customer?._id) {
      toast.error("Customer profile missing. Refresh & retry.");
      return null;
    }

    let customerId = customer?._id;

    if (!customerId) {
      const created = await ensureGuestCustomer?.();
      customerId = created?._id;
    }

    if (!customerId) {
      toast.error("Customer missing. Please try again.");
      return null;
    }

    if (!selectedAddressObj?._id) {
      toast.error("Please select/save an address first.");
      return null;
    }

    const orderItems = getCheckoutPayload?.();
    if (!orderItems?.length) {
      toast.error("Cart items missing.");
      return null;
    }

    return await createOrder({
      customerId,
      shippingAddressId: selectedAddressObj._id,
      billingAddressId: selectedAddressObj._id,
      items: orderItems,
      paymentMethod: "razorpay",
      source: "website",
      discount: Number(discount || 0),
      coupon: coupon ? { code: coupon.code } : null,
      ...getWalletPayload(),
    });
  };

  const placeNormalOrder = () => {
    const err = validate?.();
    if (err) return toast.error(err);

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
          onClick={() => setShowPayment((s) => !s)}
          className="flex w-full items-center justify-between"
        >
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">Step 3</div>
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
                        Balance:{" "}
                        <b className="tabular-nums">
                          ₹{money(safeWalletBalance)}
                        </b>
                      </div>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => updateWalletToggle(e.target.checked)}
                      className="h-4 w-4 accent-black"
                    />
                    Use Credits
                  </label>
                </div>

                {useWallet && (
                  <div className="mt-4 border border-neutral-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                    Credits Applied:{" "}
                    <b className="tabular-nums">
                      ₹{money(appliedWalletAmount)}
                    </b>{" "}
                    • Remaining Payable:{" "}
                    <b className="tabular-nums">
                      ₹{money(remainingAfterWallet)}
                    </b>
                  </div>
                )}
              </div>
            )}

            <div className="mb-2.5 flex items-center justify-between gap-3 border border-neutral-200 bg-[#fbfaf7] px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black">
                Choose Your Payment
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-black/40">
                {isOnline ? "Online Selected" : "Offline Selected"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PayCard
                label="Offline / COD"
                value="cod"
                icon={<Wallet />}
                sub={
                  appliedWalletAmount > 0
                    ? `Pay ₹${money(remainingAfterWallet)} on delivery`
                    : "Pay when your order arrives"
                }
                selected={selectedPayment}
                setSelected={handleSelectPayment}
              />

              <PayCard
                label="Online Payment"
                value="razorpay"
                icon={<IndianRupee />}
                sub={
                  appliedWalletAmount > 0
                    ? `Pay ₹${money(finalPayable)} online after credits`
                    : "UPI / Cards / Netbanking via Razorpay"
                }
                selected={selectedPayment}
                setSelected={handleSelectPayment}
                badge={
                  <span className="inline-flex items-center gap-1.5 border border-neutral-200 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-black">
                    <Sparkles className="h-3.5 w-3.5" />
                    10% EXTRA OFF
                  </span>
                }
              />
            </div>
          </div>
        )}

        {showPayment && isOnline && remainingAfterWallet > 0 && (
          <div className="mt-3 border border-neutral-200 bg-[#fbfaf7] px-3 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-9 place-items-center border border-neutral-200 bg-white text-black">
                <ShieldCheck className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-black">
                  Online Payment Offer Applied
                  <span className="inline-flex items-center gap-1 bg-black px-2 py-0.5 text-[9px] font-black text-white">
                    <Sparkles className="h-3 w-3" />
                    10% OFF
                  </span>
                </div>

                {showExtra && (
                  <div className="mt-2 inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                    <Sparkles className="h-4 w-4 text-black" />
                    You save{" "}
                    <span className="font-extrabold tabular-nums">
                      ₹{money(safeExtra)}
                    </span>{" "}
                    extra with Online Payment
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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

            {showExtra && (
              <div className="mt-1 flex items-center justify-between text-sm text-black">
                <span className="truncate">
                  Online Payment Offer <b>(10% extra)</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(safeExtra)}
                </span>
              </div>
            )}

            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/42">Total Payment</div>
            <div className="text-xl font-black tabular-nums text-black">
              ₹{money(finalPayable)}
            </div>

            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
              Shipping: <span className="font-black text-black">Free</span>
            </div>
          </div>

          <Chip tone={isOnline ? "success" : appliedWalletAmount > 0 ? "wallet" : "neutral"}>
            <IndianRupee className="h-3.5 w-3.5" />
            {finalPayable === 0
              ? "Credits"
              : isOnline
              ? "Online"
              : appliedWalletAmount > 0
              ? "Credits + COD"
              : "COD"}
          </Chip>
        </div>

        {isOnline && finalPayable > 0 ? (
          <div className="mt-4">
            <RazorpayCheckoutButton
              disabled={disabledCTA}
              createOrder={createRazorpayOrder}
            />
          </div>
        ) : (
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
        )}

        {validationError ? (
          <p className="mt-2 text-center text-[11px] text-red-600">
            {validationError}
          </p>
        ) : (
          <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-500">
            {finalPayable === 0
              ? "Your order will be fully paid using OATCLUB credits."
              : appliedWalletAmount > 0
              ? "Credits will be used first. Remaining amount will be paid by selected method."
              : isCOD
              ? "You’ll pay when the order is delivered."
              : "Your payment is secured via Razorpay."}
          </p>
        )}
      </GlassCard>
    </>
  );
}
