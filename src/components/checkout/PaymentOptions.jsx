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
} from "lucide-react";

import RazorpayCheckoutButton from "@/components/checkout/RazorpayCheckoutButton";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-[22px] bg-white/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </div>
);

const Chip = ({ children, tone = "neutral" }) => {
  const toneCls =
    tone === "success"
      ? "bg-green-50 text-green-800 border border-green-200/70"
      : tone === "wallet"
      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
      : "bg-black/4 text-gray-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] ${toneCls}`}
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
      className={`w-full rounded-2xl px-4 py-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "bg-white" : "bg-white/60 hover:bg-white/80"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-black/4 text-gray-800">
            {icon}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-900">{label}</div>
              {badge}
            </div>
            <div className="truncate text-xs text-gray-500">{sub}</div>
          </div>
        </div>

        <span
          className={`size-5 shrink-0 rounded-full border-2 transition ${
            active ? "border-black bg-black" : "border-black/20"
          }`}
        />
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
      <GlassCard className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowPayment((s) => !s)}
          className="flex w-full items-center justify-between"
        >
          <div className="min-w-0">
            <div className="text-sm text-gray-500">Step 3</div>
            <div className="text-lg font-semibold text-gray-900">
              Payment Method
            </div>
          </div>
          {showPayment ? <ChevronUp /> : <ChevronDown />}
        </button>

        {showPayment && (
          <div className="pt-4">
            {hasWalletBalance && (
              <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                      <Wallet className="h-5 w-5" />
                    </span>

                    <div>
                      <div className="text-sm font-extrabold text-emerald-950">
                        Miray Credits Available
                      </div>
                      <div className="mt-0.5 text-xs text-emerald-800">
                        Balance:{" "}
                        <b className="tabular-nums">
                          ₹{money(safeWalletBalance)}
                        </b>
                      </div>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-900 shadow-sm">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => updateWalletToggle(e.target.checked)}
                      className="h-4 w-4 accent-emerald-700"
                    />
                    Use Credits
                  </label>
                </div>

                {useWallet && (
                  <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs text-emerald-900">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PayCard
                label="Cash on Delivery"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-gradient-to-r from-amber-50 to-green-50 px-2.5 py-1 text-[10px] font-extrabold text-green-900 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    10% EXTRA OFF
                  </span>
                }
              />
            </div>
          </div>
        )}

        {showPayment && isOnline && remainingAfterWallet > 0 && (
          <div className="mt-3 rounded-2xl border border-green-300 bg-gradient-to-r from-green-50 via-emerald-50 to-amber-50 px-4 py-3 shadow-[0_14px_34px_rgba(16,185,129,0.18)]">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-9 place-items-center rounded-2xl border border-green-200/60 bg-white text-green-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-extrabold text-green-900">
                  Online Payment Offer Applied
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    10% OFF
                  </span>
                </div>

                {showExtra && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-green-200/60 bg-white/80 px-3 py-1.5 text-xs text-green-900 shadow-sm">
                    <Sparkles className="h-4 w-4 text-green-700" />
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

      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {coupon && Number(discount || 0) > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-green-700">
                <span className="truncate">
                  Coupon <b>{coupon.code}</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(discount)}
                </span>
              </div>
            )}

            {appliedWalletAmount > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-emerald-700">
                <span className="truncate">
                  Wallet Credits <b>Applied</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(appliedWalletAmount)}
                </span>
              </div>
            )}

            {showExtra && (
              <div className="mt-1 flex items-center justify-between text-sm text-green-700">
                <span className="truncate">
                  Online Payment Offer <b>(10% extra)</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(safeExtra)}
                </span>
              </div>
            )}

            <div className="mt-2 text-sm text-gray-500">Total Payment</div>
            <div className="text-2xl font-semibold tabular-nums text-gray-900">
              ₹{money(finalPayable)}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Shipping: <span className="font-semibold text-green-700">Free</span>
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
            className="mt-4 w-full rounded-2xl bg-black py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(0,0,0,0.24)] transition hover:opacity-90 active:scale-[0.99] disabled:bg-black/20 disabled:text-black/40"
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
              ? "Your order will be fully paid using Miray credits."
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