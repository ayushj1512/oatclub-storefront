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
import PaymentCard from "@/components/checkout/OnlinePaymentButton";

/* ---------- UI ---------- */
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
      : "bg-black/4 text-gray-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] ${toneCls}`}
    >
      {children}
    </span>
  );
};

function PayCard({ label, value, icon, sub, selected, setSelected, badge = null }) {
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      aria-pressed={active}
      className={`w-full rounded-2xl px-4 py-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition active:scale-[0.99] ${
        active ? "bg-white" : "bg-white/60 hover:bg-white/80"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center size-10 rounded-2xl bg-black/4 text-gray-800 shrink-0">
            {icon}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-900">{label}</div>
              {badge}
            </div>
            <div className="text-xs text-gray-500 truncate">{sub}</div>
          </div>
        </div>

        <span
          className={`size-5 rounded-full border-2 transition shrink-0 ${
            active ? "border-black bg-black" : "border-black/20"
          }`}
        />
      </div>
    </button>
  );
}

/* ---------- utils ---------- */
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

  payable, // payable should already include coupon + razorpay extra off from CheckoutPage
  subtotal = 0, // ✅ optional (for showing “you save ₹x” nicely). Pass from CheckoutPage if you can.
  razorpayExtraDiscount = 0, // ✅ pass from CheckoutPage if you can (recommended)

  coupon,
  discount,

  placing,
  validate,
  setShowCodCaptcha,

  selectedAddressObj,
  user,
  customer,

  ensureGuestCustomer,
  createOrder,
  getCheckoutPayload,
}) {
  /* ✅ Single source of truth for disable state */
  const validationError = validate?.() || null;
  const disabledCTA = placing || !!validationError;

  /* ✅ Online payment extra offer */
  const isOnline = String(selectedPayment).toLowerCase() === "razorpay";
  const safeExtra = Math.max(0, toNum(razorpayExtraDiscount));
  const showExtra = isOnline && safeExtra > 0;

  /* ---------------- Razorpay Order Builder ---------------- */
  const createRazorpayOrder = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return null;
    }

    // ✅ logged-in must have customer
    if (user?.uid && !customer?._id) {
      toast.error("Customer profile missing. Refresh & retry.");
      return null;
    }

    // ✅ resolve customer id (guest create if missing)
    let customerId = customer?._id;

    if (!user?.uid && !customerId) {
      const created = await ensureGuestCustomer();
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

    // ✅ IMPORTANT: pass discount at top-level (coupon store discount)
    // Razorpay extra 5% is already applied inside orderStore.createOrder (backend payload gets combined discount)
    return await createOrder({
      customerId,
      shippingAddressId: selectedAddressObj._id,
      billingAddressId: selectedAddressObj._id,
      items: orderItems,
      paymentMethod: "razorpay",
      source: "website",
      discount: Number(discount || 0), // ✅ critical
      coupon: coupon ? { code: coupon.code } : null, // ✅ keep minimal
    });
  };

  return (
    <>
      {/* STEP 3 PAYMENT SELECTION */}
      <GlassCard className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowPayment((s) => !s)}
          className="w-full flex items-center justify-between"
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
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <PayCard
              label="Cash on Delivery"
              value="cod"
              icon={<Wallet />}
              sub="Pay when your order arrives"
              selected={selectedPayment}
              setSelected={setSelectedPayment}
            />

            {/* ✅ Online payment with a “5% extra off” badge */}
            <PayCard
              label="Online Payment"
              value="razorpay"
              icon={<IndianRupee />}
              sub="UPI / Cards / Netbanking via Razorpay"
              selected={selectedPayment}
              setSelected={setSelectedPayment}
              badge={
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-800 border border-green-200/70">
                  <Sparkles className="w-3 h-3" />
                  5% extra off
                </span>
              }
            />
          </div>
        )}

        {/* ✅ Offer / security strip */}
        {showPayment && isOnline && (
          <div className="mt-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border border-green-200/70">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid place-items-center size-9 rounded-2xl bg-white shadow-sm border border-green-200/60 text-green-700">
                <ShieldCheck className="w-4 h-4" />
              </span>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-green-900">
                  Online Payment Offer Applied
                </div>
                <div className="text-xs text-green-800/80 mt-0.5">
                  Pay online & get <b>extra 5% off</b> instantly. Secure checkout
                  via Razorpay (UPI, Cards, Netbanking).
                </div>

                {showExtra && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5 text-xs text-green-900 border border-green-200/60">
                    <Sparkles className="w-4 h-4 text-green-700" />
                    You save{" "}
                    <span className="font-semibold tabular-nums">
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

      {/* STEP 4 TOTAL + CTA */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* Coupon line */}
            {coupon && Number(discount || 0) > 0 && (
              <div className="flex items-center justify-between text-sm text-green-700 mt-1">
                <span className="truncate">
                  Coupon <b>{coupon.code}</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(discount)}
                </span>
              </div>
            )}

            {/* Online extra off line */}
            {showExtra && (
              <div className="flex items-center justify-between text-sm text-green-700 mt-1">
                <span className="truncate">
                  Online Payment Offer <b>(5% extra)</b>
                </span>
                <span className="shrink-0 tabular-nums">
                  − ₹{money(safeExtra)}
                </span>
              </div>
            )}

            <div className="text-sm text-gray-500 mt-2">Total Payment</div>
            <div className="text-2xl font-semibold text-gray-900 tabular-nums">
              ₹{money(payable)}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Shipping:{" "}
              <span className="text-green-700 font-semibold">Free</span>
            </div>

            {/* Optional: show “you’ll pay ₹x more on COD” nudge */}
            {String(selectedPayment).toLowerCase() === "cod" &&
              Math.max(0, toNum(razorpayExtraDiscount)) > 0 && (
                <div className="mt-2 text-[11px] text-gray-600">
                  Tip: Pay online to save{" "}
                  <span className="font-semibold text-green-700">
                    ₹{money(toNum(razorpayExtraDiscount))}
                  </span>{" "}
                  extra.
                </div>
              )}
          </div>

          <Chip tone={isOnline ? "success" : "neutral"}>
            <IndianRupee className="w-3.5 h-3.5" />
            {isOnline ? "Online (5% off)" : "COD"}
          </Chip>
        </div>

        {/* CTA */}
        {String(selectedPayment).toLowerCase() === "cod" ? (
          <button
            type="button"
            onClick={() => {
              const err = validate();
              if (err) return toast.error(err);
              setShowCodCaptcha(true);
            }}
            disabled={disabledCTA}
            className="mt-4 w-full rounded-2xl bg-black py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(0,0,0,0.24)] transition hover:opacity-90 active:scale-[0.99] disabled:bg-black/20 disabled:text-black/40"
          >
            {placing ? "Placing..." : "Place Order (COD)"}
            <ArrowRight className="inline-block w-4 h-4 ml-2" />
          </button>
        ) : (
          <div className="mt-4">
            <RazorpayCheckoutButton disabled={disabledCTA} createOrder={createRazorpayOrder} />
            {showExtra && (
              <p className="mt-2 text-[11px] text-green-700 text-center">
                Paying online saves you <b>₹{money(safeExtra)}</b> extra (5% off).
              </p>
            )}
          </div>
        )}

        {/* Reason why disabled (better UX) */}
        {validationError ? (
          <p className="mt-2 text-[11px] text-red-600 text-center">
            {validationError}
          </p>
        ) : (
          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed text-center">
            {String(selectedPayment).toLowerCase() === "cod"
              ? "You’ll pay when the order is delivered."
              : "Your payment is secured via Razorpay."}
          </p>
        )}
      </GlassCard>
    </>
  );
}
