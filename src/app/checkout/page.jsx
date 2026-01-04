// src/app/checkout/page.jsx
"use client";

/**
 * ✅ Checkout (COD) + Address create (REQUIRED: firebaseUID + email + customerId)
 * ✅ Pincode autofill via useAddressStore.lookupPincode (India Post)
 * - Uses authStore.user + authStore.customer to fill required fields
 * - Pincode first, silent if not found
 */
import PaymentCard from "@/components/checkout/OnlinePaymentButton";
import CodConfirmCaptcha from "@/components/checkout/CodConfirmCaptcha";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  IndianRupee,
  Lock,
  ArrowRight,
  Wallet,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useCouponStore } from "@/store/couponStore";
import toast from "react-hot-toast";
import RazorpayCheckoutButton from "@/components/checkout/RazorpayCheckoutButton";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";

/* ---------- utils ---------- */
const money = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0");
const getImageSrc = (item) => {
  const c = [item?.image, item?.thumbnail, item?.images?.[0]?.src, item?.images?.[0]];
  const src = c.find((v) => typeof v === "string" && v.trim());
  return src || null;
};
const isObjectId = (v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

function toAddressSnapshot(addr, fallbackEmail = "") {
  if (!addr) return null;
  return {
    fullName: addr.fullName || "",
    phone: addr.phone || "",
    email: addr.email || fallbackEmail || "",
    line1: addr.addressLine1 || "",
    line2: addr.addressLine2 || "",
    city: addr.city || "",
    state: addr.state || "",
    country: addr.country || "India",
    pincode: addr.postalCode || "",
  };
}

function resolveMongoProductId(it) {
  const pid = it?.productIdMongo || it?.productId || it?._id || it?.mongoId || it?.product?._id;
  return isObjectId(pid) ? pid : null;
}

/* ---------- UI bits ---------- */
const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-[22px] bg-white/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] ${className}`}>
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
        <span className={`size-5 rounded-full border-2 transition shrink-0 ${active ? "border-black bg-black" : "border-black/20"}`} />
      </div>
    </button>
  );
}

function FormField({ label, name, value, onChange, rightNode, inputMode, placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          placeholder={placeholder}
          className="w-full rounded-2xl bg-white/80 px-4 py-3 pr-12 text-sm outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.22)] transition"
        />
        {rightNode ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightNode}</div> : null}
      </div>
    </div>
  );
}

function PremiumPinLoader() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3.5 w-11 rounded-full border border-black/10 bg-black/4 overflow-hidden relative">
        <span className="absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/80 to-transparent animate-[pinShimmer_1s_infinite]" />
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="w-1.5 h-1.5 rounded-full bg-black/30 animate-[pinDot_.85s_infinite]" />
        <i className="w-1.5 h-1.5 rounded-full bg-black/30 animate-[pinDot_.85s_infinite_.12s]" />
        <i className="w-1.5 h-1.5 rounded-full bg-black/30 animate-[pinDot_.85s_infinite_.24s]" />
      </span>
      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      <style jsx global>{`
        @keyframes pinShimmer { 0% { transform: translateX(-120%);} 100% { transform: translateX(120%);} }
        @keyframes pinDot { 0%,100% { transform: translateY(0); opacity: .55; } 50% { transform: translateY(-2px); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  // cart
  const items = useCartStore((s) => s.items) || [];
  const totalPrice = useCartStore((s) => s.totalPrice);
  const initCart = useCartStore((s) => s.initialize);
  const clearCart = useCartStore((s) => s.clearCart);

  // auth (✅ required fields come from here)
const user = useAuthStore((s) => s.user);
const customer = useAuthStore((s) => s.customer);
const loading = useAuthStore((s) => s.loading);
const initializeAuth = useAuthStore((s) => s.initialize);
const trackAddShippingInfo = useAddressStore((s) => s.trackAddShippingInfo);

const [createdOrderId, setCreatedOrderId] = useState(null);
const [showCodCaptcha, setShowCodCaptcha] = useState(false);


  // address store
  const addresses = useAddressStore((s) => s.addresses) || [];
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const createAddress = useAddressStore((s) => s.createAddress);
  const lookupPincode = useAddressStore((s) => s.lookupPincode);
  const pinLoading = useAddressStore((s) => s.pinLoading);

  // orders
const createOrder = useOrderStore((s) => s.createOrder);

  const placing = useOrderStore((s) => s.placing);

  // sections
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPayment, setShowPayment] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("cod");

  const subtotal = useMemo(() => (typeof totalPrice === "function" ? totalPrice() : 0), [items, totalPrice]);

  const coupon = useCouponStore((s) => s.coupon);
const discount = useCouponStore((s) => s.discount);
const finalTotal = useCouponStore((s) => s.finalTotal);
const payable = useMemo(() => {
  const d = Math.max(0, Number(discount || 0));
  return Math.max(0, subtotal - d);
}, [subtotal, discount]);


  const selectedAddressObj = useMemo(() => {
    if (!selectedAddressId) return null;
    return addresses.find((a) => String(a?._id) === String(selectedAddressId)) || null;
  }, [addresses, selectedAddressId]);

  const ga4Items = useMemo(() => {
  return (items || []).map((it) =>
    mapItem(
      {
        _id: it?.productId,
        id: it?.productId,
        name: it?.name,
        title: it?.name,
        price: Number(it?.price || 0),
        category: it?.productSnapshot?.category || "",
        variant: it?.selectedSize || "",
        sku: it?.variant?.sku || it?.productSnapshot?.sku || "",
      },
      Number(it?.quantity ?? it?.qty ?? 1)
    )
  );
}, [items]);

  // ✅ GA4 + Meta: add_shipping_info (fires when address is selected)
const lastShipKey = useRef("");

useEffect(() => {
  if (!selectedAddressObj?._id) return;
  if (!items?.length) return;

  const key = `${selectedAddressObj._id}_${payable}`;
  if (lastShipKey.current === key) return;
  lastShipKey.current = key;

  try {
    trackAddShippingInfo?.({
      currency: "INR",
      value: Number(payable || 0),
      addressId: selectedAddressObj._id,
      shippingTier: "standard",
      items: ga4Items,
    });
  } catch (e) {
    console.warn("📦 add_shipping_info failed", e);
  }
}, [selectedAddressObj?._id, payable, items?.length, ga4Items]);

  // address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    // form fields
    postalCode: "",
    city: "",
    state: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    addressType: "home",

    // ✅ REQUIRED by backend
    firebaseUID: "",
    email: "",
    customerId: "",
  });

  // pincode debounce / race
  const pinTimer = useRef(null);
  const lastPin = useRef("");

  // init
  useEffect(() => {
    initCart?.();
    initializeAuth?.();
  }, []); // run once

  useEffect(() => {
  if (loading) return; // ⏳ wait for Firebase auth

  if (!user?.uid) {
   toast.error("Login required to continue");
router.replace("/login?redirect=/checkout");

  }
}, [loading, user?.uid, router]);

  // when auth ready: fetch addresses + prefill required fields
  useEffect(() => {
    if (!user?.uid) return;

    fetchAddresses?.(user.uid);

    setAddressForm((p) => ({
      ...p,
      firebaseUID: user.uid,
      email: user.email || p.email,
      customerId: customer?._id || p.customerId,
      fullName: p.fullName || customer?.name || user?.name || "",
      phone: p.phone || customer?.phone || "",
    }));
  }, [user?.uid, user?.email, customer?._id, customer?.name, customer?.phone]);

  // select first address
  useEffect(() => {
    if (!selectedAddressId && addresses?.length) setSelectedAddressId(addresses[0]?._id || null);
  }, [addresses, selectedAddressId]);

//   useEffect(() => {
//   if (selectedPayment !== "razorpay") return;
//   if (createdOrderId) return; // idempotent
//   if (!selectedAddressObj || !items.length) return;

//   handleRazorpayCheckout();
// }, [selectedPayment]);

  // input handler (pincode first)
  const updateAddressField = (e) => {
    const { name, value } = e.target;

    if (name === "postalCode") {
      const cleaned = String(value || "").replace(/\D/g, "").slice(0, 6);
      setAddressForm((p) => ({ ...p, postalCode: cleaned }));

      if (pinTimer.current) clearTimeout(pinTimer.current);
      if (cleaned.length !== 6) return;

      pinTimer.current = setTimeout(async () => {
        if (lastPin.current === cleaned) return;
        lastPin.current = cleaned;

        const info = await lookupPincode?.(cleaned);
        // ✅ silent if not found
        if (info?.state || info?.district || info?.city) {
          setAddressForm((p) => ({
            ...p,
            city: info.city || info.district || p.city,
            state: info.state || p.state,
          }));
        }
      }, 250);

      return;
    }

    setAddressForm((p) => ({ ...p, [name]: value }));
  };

  const saveNewAddress = async () => {
    // ✅ ensure required fields exist
    const firebaseUID = user?.uid;
    const email = user?.email;
    const customerId = customer?._id;

    if (!firebaseUID || !email || !customerId) {
     toast.error("Please login again. Customer profile is not ready yet.");
return;
    }

    // basic validation
   if (!addressForm.postalCode || addressForm.postalCode.length !== 6) {
  toast.error("Enter a valid 6-digit pincode");
  return;
}

   if (!addressForm.addressLine1) {
  toast.error("Address line 1 is required");
  return;
}
if (!addressForm.fullName) {
  toast.error("Full name is required");
  return;
}
if (!addressForm.phone) {
  toast.error("Phone is required");
  return;
}


    try {
      setSavingAddress(true);

      const payload = {
        ...addressForm,
        firebaseUID,
        email,
        customerId,

        // keep these aligned if user didn't type
        fullName: addressForm.fullName || customer?.name || user?.name || "",
        phone: addressForm.phone || customer?.phone || "",
      };

      const created = await createAddress?.(payload);
      setShowAddressForm(false);

      if (created?._id) setSelectedAddressId(created._id);
    } finally {
      setSavingAddress(false);
    }
  };

  const validate = () => {
    if (!items?.length) return "Your cart is empty.";
    if (!user?.uid) return "Please login to continue.";
    if (!customer?._id) return "Customer profile not ready yet. Please try again.";
    if (!selectedAddressObj) return "Please select an address.";
if (!["cod", "razorpay"].includes(selectedPayment)) {
  return "Invalid payment method selected.";
}

    const bad = items.find((it) => !resolveMongoProductId(it));
    if (bad) return `Cart item missing Mongo ObjectId. Found "${String(bad?.productId || bad?._id || "")}".`;
    return null;
  };


const [paymentRecovery, setPaymentRecovery] = useState({
  open: false,
  orderId: null,
  orderNumber: null,
});


const handlePlaceOrder = async () => {
  const err = validate();
  if (err) {
    toast.error(err);
    return;
  }

  if (!selectedAddressObj?._id) {
    toast.error("Shipping address not selected.");
    return;
  }

  const toastId = toast.loading("Placing your order...");

  try {
    /* ---------------- CREATE ORDER ---------------- */
    const order = await createOrder({
      customerId: customer._id,

      // ✅ REQUIRED BY BACKEND
      shippingAddressId: selectedAddressObj._id,
      billingAddressId: selectedAddressObj._id,

paymentMethod: selectedPayment,

      items: items.map((it) => {
        const productId = resolveMongoProductId(it);
        const qty = Number(it?.qty ?? it?.quantity ?? 1);
        const variantId = isObjectId(String(it?.variantId || ""))
          ? String(it.variantId)
          : null;

        return {
          productId,
          quantity: qty,
          ...(variantId ? { variantId } : {}),
        };
      }),

      source: "website",

      coupon: coupon
        ? {
            code: coupon.code,
            discount,
            finalTotal: payable,
          }
        : null,
    });

    /* ------------------------------------------------
       🔥 ABANDONED CART → RECOVERED
    ------------------------------------------------- */
    try {
      const abandoned = useAbandonedCartStore.getState();
      const cart = abandoned.cart;

      if (cart?._id) {
        await abandoned.markRecovered(cart._id, order._id);
      }
    } catch (e) {
      console.warn("⚠️ Failed to mark abandoned cart recovered", e);
    }

    /* ---------------- CLEANUP + REDIRECT ---------------- */
    clearCart?.();

    toast.success("Order placed successfully!", { id: toastId });

    router.push(
      order?.orderNumber
        ? `/order-success?order=${order.orderNumber}`
        : "/order-success"
    );
  } catch (e) {
    toast.error(e?.message || "Failed to place order.", { id: toastId });
  }
};



const checkoutTracked = useRef(false);

useEffect(() => {
  if (checkoutTracked.current) return;
  if (!items?.length) return;

  checkoutTracked.current = true;

  try {
    pushEcomEvent("begin_checkout", {
      currency: "INR",
      value: Number(payable || 0),
      coupon: coupon?.code || undefined,
      items: ga4Items,
    });
  } catch (e) {
    console.warn("📈 GA4 begin_checkout failed", e);
  }
}, [items?.length, payable, coupon?.code, ga4Items]);



  return (
    <section className="w-full min-h-screen bg-[#F6F6F8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/[0.06] to-transparent" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Checkout</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Chip><Lock className="w-3.5 h-3.5" /> Secure</Chip>
            <Chip>Fast dispatch</Chip>
            <Chip>Easy returns</Chip>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* 1) Summary */}
        {/* 1) Summary */}
<GlassCard className="p-4 sm:p-5">
  <button type="button" onClick={() => setShowSummary((s) => !s)} className="w-full flex items-center justify-between">
    <div className="min-w-0">
      <div className="text-sm text-gray-500">Step 1</div>
      <div className="text-lg font-semibold text-gray-900">Order Summary</div>
    </div>
    {showSummary ? <ChevronUp /> : <ChevronDown />}
  </button>

  {showSummary && (
    <div className="mt-4 space-y-3">
      {items.length ? (
        <>
          {/* ITEMS LIST */}
          <div className="space-y-3">
            {items.map((item) => {
              const src = getImageSrc(item);
              const qty = Number(item?.qty ?? item?.quantity ?? 1);
              const price = Number(item?.price ?? 0);
              const key = `${String(item?.productId || item?._id || item?.id || "")}__${String(item?.variantId || "")}`;

              return (
                <div key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-[64px] w-[56px] shrink-0 overflow-hidden rounded-xl bg-black/4">
                      {src ? (
                        <Image src={src} alt={item?.name || "Product"} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] text-black/50">No image</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">{item?.name || "Product"}</p>
                      <p className="text-xs text-black/60">Qty: {qty}</p>
                    </div>
                  </div>

                  <p className="shrink-0 tabular-nums text-sm font-semibold text-black">₹{money(price * qty)}</p>
                </div>
              );
            })}
          </div>

          {/* TOTALS */}
          <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold tabular-nums text-gray-900">₹{money(subtotal)}</span>
            </div>

{/* ✅ COUPON SECTION */}



            {/* ✅ COUPON LINE */}
            {coupon?.code && Number(discount || 0) > 0 && (
              <div className="flex items-center justify-between text-sm text-green-700">
                <span>Coupon <b>{coupon.code}</b></span>
                <span className="font-semibold tabular-nums">− ₹{money(discount)}</span>
              </div>
            )}

            <div className="h-px bg-black/5 my-1" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Payable</span>
              <span className="text-lg font-semibold tabular-nums text-gray-900">₹{money(payable)}</span>
            </div>

            <div className="text-[11px] text-gray-500">
              Shipping: <span className="text-green-700 font-semibold">Free</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-black/60">Your cart is empty.</p>
      )}
    </div>
  )}
</GlassCard>

            <CheckoutCouponSection cartTotal={subtotal} />


          {/* 2) Address */}
          <GlassCard className="p-4 sm:p-5">
            <button type="button" onClick={() => setShowAddress((s) => !s)} className="w-full flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-gray-500">Step 2</div>
                <div className="text-lg font-semibold text-gray-900">Delivery Address</div>
              </div>
              {showAddress ? <ChevronUp /> : <ChevronDown />}
            </button>

            {showAddress && (
              <div className="pt-4 space-y-4">
                {addresses.length ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const active = String(selectedAddressId) === String(addr?._id);
                      return (
                        <label
                          key={addr._id}
                          className={`block rounded-2xl p-4 cursor-pointer transition shadow-[0_10px_25px_rgba(0,0,0,0.06)] ${
                            active ? "bg-white" : "bg-white/60 hover:bg-white/80"
                          }`}
                          onClick={() => setSelectedAddressId(addr._id)}
                        >
                          <div className="flex items-start gap-3">
                            <input type="radio" readOnly checked={active} className="mt-1 w-5 h-5 accent-black" />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{addr.fullName}</p>
                              <p className="text-xs text-gray-600">{addr.phone}</p>
                              <p className="text-sm text-gray-700 mt-1 leading-5">
                                {addr.addressLine1}
                                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.postalCode}
                              </p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No saved addresses.</p>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddressForm((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-black text-white px-4 py-2 text-sm font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.18)] active:scale-[0.99] transition"
                >
                  <Plus size={16} /> Add New Address
                </button>

                {showAddressForm && (
                  <div className="rounded-2xl bg-white/70 p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
                    <h3 className="font-semibold text-gray-900 mb-3">New Address</h3>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* ✅ PINCODE FIRST */}
  <FormField
    label="PIN Code (enter first)"
    name="postalCode"
    value={addressForm.postalCode}
    onChange={updateAddressField}
    inputMode="numeric"
    placeholder="6-digit pincode"
    rightNode={
      addressForm.postalCode?.length === 6 ? (
        pinLoading ? (
          <PremiumPinLoader />
        ) : addressForm.city || addressForm.state ? (
          <CheckCircle2 className="w-4 h-4 text-black" />
        ) : null
      ) : null
    }
  />

  <FormField
    label="Full Name"
    name="fullName"
    value={addressForm.fullName}
    onChange={updateAddressField}
  />

  <FormField
    label="Phone"
    name="phone"
    value={addressForm.phone}
    onChange={updateAddressField}
  />

  <FormField
    label="City"
    name="city"
    value={addressForm.city}
    onChange={updateAddressField}
    placeholder={pinLoading ? "Auto-filling…" : "City"}
  />

  <FormField
    label="State"
    name="state"
    value={addressForm.state}
    onChange={updateAddressField}
    placeholder={pinLoading ? "Auto-filling…" : "State"}
  />

  <FormField
    label="Address Line 1"
    name="addressLine1"
    value={addressForm.addressLine1}
    onChange={updateAddressField}
  />

  <FormField
    label="Address Line 2"
    name="addressLine2"
    value={addressForm.addressLine2}
    onChange={updateAddressField}
  />

  {/* required fields (hidden) */}
  <input type="hidden" name="firebaseUID" value={addressForm.firebaseUID} readOnly />
  <input type="hidden" name="email" value={addressForm.email} readOnly />
  <input type="hidden" name="customerId" value={addressForm.customerId} readOnly />
</div>


             <button
  type="button"
  onClick={saveNewAddress}
  disabled={savingAddress}
  className="mt-4 w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition hover:opacity-90 disabled:bg-black/20 disabled:text-black/40 active:scale-[0.99]"
>
  {savingAddress ? "Saving..." : "Save Address"}
</button>

                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* 3) Payment */}
          <GlassCard className="p-4 sm:p-5">
            <button type="button" onClick={() => setShowPayment((s) => !s)} className="w-full flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-gray-500">Step 3</div>
                <div className="text-lg font-semibold text-gray-900">Payment Method</div>
              </div>
              {showPayment ? <ChevronUp /> : <ChevronDown />}
            </button>

            {showPayment && (
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <PayCard label="Cash on Delivery" value="cod" icon={<Wallet />} sub="Pay on delivery" selected={selectedPayment} setSelected={setSelectedPayment} />
              

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

          {/* 4) Total + CTA */}
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
                <div className="text-2xl font-semibold text-gray-900 tabular-nums"> ₹{money(payable)}</div>
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
  /* ---------------- COD FLOW ---------------- */
 <button
  type="button"
  onClick={() => setShowCodCaptcha(true)}
  disabled={!items?.length || placing}
  className="mt-4 w-full rounded-2xl bg-black py-3 text-base font-semibold text-white
             shadow-[0_16px_34px_rgba(0,0,0,0.24)]
             transition hover:opacity-90 active:scale-[0.99]
             disabled:bg-black/20 disabled:text-black/40"
>

    {placing ? "Placing order..." : "Place Order (COD)"}
    <ArrowRight className="inline-block w-4 h-4 ml-2" />
  </button>
) : (
  /* ---------------- RAZORPAY FLOW ---------------- */
  <>
<RazorpayCheckoutButton
  disabled={!items?.length || placing}
  createOrder={async () => {
    const shipSnap = toAddressSnapshot(
      selectedAddressObj,
      user?.email || ""
    );

   return await createOrder({
  customerId: customer._id,

  // ✅ FIX
  shippingAddressId: selectedAddressObj._id,
  billingAddressId: selectedAddressObj._id,

  items: useCartStore.getState().toOrderItems(),

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



  </>
)}



            <p className="mt-2 text-[11px] text-gray-500 leading-relaxed text-center">
              You’ll pay when the order is delivered.
            </p>
          </GlassCard>
        </div>
      </div>

      {paymentRecovery.open && (
  <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 shadow">
    <p className="text-sm font-semibold text-gray-900">
      Payment not completed
    </p>
    <p className="text-xs text-gray-600 mt-1">
      Choose how you want to continue
    </p>

    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
  {/* 🔁 Retry Online */}
  <button
    onClick={() => {
      setPaymentRecovery({ open: false });
    }}
    className="flex-1 rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
  >
    Retry Online Payment
  </button>

  {/* 🚚 Convert to COD */}
  <button
    onClick={async () => {
      try {
        await updateOrderStatus(paymentRecovery.orderId, {
paymentMethod: selectedPayment,
        });

      toast.success("Order converted to Cash on Delivery");


        clearCart?.();
        router.replace(
          `/order-success?order=${paymentRecovery.orderNumber}`
        );
      } catch {
      toast.error("Failed to switch to COD");

      }
    }}
    className="flex-1 rounded-xl border border-black/20 py-3 text-sm font-semibold text-black transition hover:bg-black/5 active:scale-[0.99]"
  >
    Place Order as COD
  </button>
</div>

  </div>
)}
<CodConfirmCaptcha
  open={showCodCaptcha}
  onClose={() => setShowCodCaptcha(false)}
  onVerified={handlePlaceOrder}
/>


    </section>
    
  );
}
