"use client";

import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, IndianRupee, Wallet, ArrowRight } from "lucide-react";
import RazorpayCheckoutButton from "@/components/checkout/RazorpayCheckoutButton";
import PaymentCard from "@/components/checkout/OnlinePaymentButton";

/* ---------- UI bits ---------- */
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-[22px] bg-white/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </div>
);

const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/4 px-3 py-1 text-[11px] text-gray-700">
    {children}
  </span>
);

function PayCard({ label, value, icon, sub, selected, setSelected }) {
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
            <div className="text-sm font-semibold text-gray-900">{label}</div>
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

export default function PaymentOptions({
  showPayment,
  setShowPayment,

  selectedPayment,
  setSelectedPayment,

  payable,
  coupon,
  discount,

  placing,
  canCheckout,
  validate,

  setShowCodCaptcha,

  items,
  selectedAddressObj,
  user,
  customer,
  ensureGuestCustomer,
  createOrder,
}) {
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
            <div className="text-lg font-semibold text-gray-900">Payment Method</div>
          </div>
          {showPayment ? <ChevronUp /> : <ChevronDown />}
        </button>

        {showPayment && (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <PayCard
              label="Cash on Delivery"
              value="cod"
              icon={<Wallet />}
              sub="Pay on delivery"
              selected={selectedPayment}
              setSelected={setSelectedPayment}
            />

            <PaymentCard
              label="Online Payment"
              value="razorpay"
              icon={<IndianRupee />}
              sub="UPI / Cards / Netbanking"
              selected={selectedPayment}
              setSelected={setSelectedPayment}
            />
          </div>
        )}

        {showPayment && selectedPayment === "razorpay" && (
          <div className="mt-3 text-xs text-green-700 bg-green-50 rounded-2xl px-4 py-3">
            Secure online payment via UPI, Cards & Netbanking
          </div>
        )}
      </GlassCard>

      {/* STEP 4 TOTAL + CTA */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            {coupon && discount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-700 mt-2">
                <span>
                  Coupon <b>{coupon.code}</b>
                </span>
                <span>− ₹{money(discount)}</span>
              </div>
            )}

            <div className="text-sm text-gray-500">Total Payment</div>
            <div className="text-2xl font-semibold text-gray-900 tabular-nums">
              ₹{money(payable)}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Shipping: <span className="text-green-700 font-semibold">Free</span>
            </div>
          </div>

          <Chip>
            <IndianRupee className="w-3.5 h-3.5" />
            {selectedPayment === "cod" ? "COD" : "Online"}
          </Chip>
        </div>

        {/* CTA */}
        {selectedPayment === "cod" ? (
          <button
            type="button"
            onClick={() => {
              const err = validate();
              if (err) return toast.error(err);
              setShowCodCaptcha(true);
            }}
            disabled={!canCheckout}
           className={`mt-4 w-full rounded-2xl bg-black py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(0,0,0,0.24)] transition hover:opacity-90 active:scale-[0.99] disabled:bg-black/20 disabled:text-black/40`}

          >
            {placing ? "Placing order..." : "Place Order (COD)"}
            <ArrowRight className="inline-block w-4 h-4 ml-2" />
          </button>
        ) : (
          <RazorpayCheckoutButton
            disabled={!items?.length || placing}
            createOrder={async () => {
              // ✅ basic guards
              if (!items?.length) {
                toast.error("Your cart is empty.");
                return null;
              }
              if (!selectedAddressObj?._id) {
                toast.error("Please select an address first.");
                return null;
              }

              // ✅ logged-in must have customer
              if (user?.uid && !customer?._id) {
                toast.error("Customer profile missing. Refresh & retry.");
                return null;
              }

              // ✅ resolve customerId safely
              let customerId = customer?._id;

              // ✅ guest flow only
              if (!user?.uid && !customerId) {
                const created = await ensureGuestCustomer();
                customerId = created?._id;
              }

              if (!customerId) {
                toast.error("Customer profile missing. Please try again.");
                return null;
              }

              return await createOrder({
                customerId,

                shippingAddressId: selectedAddressObj._id,
                billingAddressId: selectedAddressObj._id,

                items: items.map((it) => ({
                  productId: it.productIdMongo || it.productId || it._id,
                  quantity: Number(it?.qty ?? it?.quantity ?? 1),
                })),

                paymentMethod: "razorpay",
                source: "website",

                coupon: coupon
                  ? {
                      code: coupon.code,
                      discount,
                      finalTotal: payable,
                    }
                  : null,
              });
            }}
          />
        )}

        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed text-center">
          You’ll pay when the order is delivered.
        </p>
      </GlassCard>
    </>
  );
}
