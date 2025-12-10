// src/app/checkout/page.jsx
"use client";

/**
 * ✅ Checkout (COD) + Address create (REQUIRED: firebaseUID + email + customerId)
 * ✅ Pincode autofill via useAddressStore.lookupPincode (India Post)
 * - Uses authStore.user + authStore.customer to fill required fields
 * - Pincode first, silent if not found
 */

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

const BRAND = "#800020";

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
  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-[11px] text-gray-700">
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
          <span className="grid place-items-center size-10 rounded-2xl bg-black/[0.04] text-gray-800 shrink-0">
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
      <span className="h-[14px] w-[44px] rounded-full border border-black/10 bg-black/[0.04] overflow-hidden relative">
        <span className="absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[pinShimmer_1s_infinite]" />
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
  const initializeAuth = useAuthStore((s) => s.initialize);

  // address store
  const addresses = useAddressStore((s) => s.addresses) || [];
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const createAddress = useAddressStore((s) => s.createAddress);
  const lookupPincode = useAddressStore((s) => s.lookupPincode);
  const pinLoading = useAddressStore((s) => s.pinLoading);

  // orders
  const createCodOrder = useOrderStore((s) => s.createCodOrder);
  const placing = useOrderStore((s) => s.placing);

  // sections
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPayment, setShowPayment] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("cod");

  const subtotal = useMemo(() => (typeof totalPrice === "function" ? totalPrice() : 0), [items, totalPrice]);

  const selectedAddressObj = useMemo(() => {
    if (!selectedAddressId) return null;
    return addresses.find((a) => String(a?._id) === String(selectedAddressId)) || null;
  }, [addresses, selectedAddressId]);

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
      return alert("Please login again. Customer profile is not ready yet.");
    }

    // basic validation
    if (!addressForm.postalCode || addressForm.postalCode.length !== 6) return alert("Enter valid 6-digit pincode");
    if (!addressForm.addressLine1) return alert("Address line 1 is required");
    if (!addressForm.fullName) return alert("Full name is required");
    if (!addressForm.phone) return alert("Phone is required");

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
    if (selectedPayment !== "cod") return "Online payment will be enabled soon. Please select COD for now.";
    const bad = items.find((it) => !resolveMongoProductId(it));
    if (bad) return `Cart item missing Mongo ObjectId. Found "${String(bad?.productId || bad?._id || "")}".`;
    return null;
  };

  const handlePlaceOrder = async () => {
    const err = validate();
    if (err) return alert(err);

    try {
      const shipSnap = toAddressSnapshot(selectedAddressObj, user?.email || "");
      const billSnap = shipSnap;

      const order = await createCodOrder({
        customerId: customer._id,
        shippingAddressSnapshot: shipSnap,
        billingAddressSnapshot: billSnap,
        items: items.map((it) => {
          const productId = resolveMongoProductId(it);
          const qty = Number(it?.qty ?? it?.quantity ?? 1);
          const variantId = isObjectId(String(it?.variantId || "")) ? String(it.variantId) : null;
          return { productId, quantity: qty, ...(variantId ? { variantId } : {}) };
        }),
        source: "website",
      });

      clearCart?.();
      router.push(order?.orderNumber ? `/order-success?order=${order.orderNumber}` : "/order-success");
    } catch (e) {
      alert(e?.message || "Failed to place order.");
    }
  };

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
                  items.map((item) => {
                    const src = getImageSrc(item);
                    const qty = Number(item?.qty ?? 1);
                    const price = Number(item?.price ?? 0);
                    const key = `${String(item?.productId || item?._id || item?.id || "")}__${String(item?.variantId || "")}`;

                    return (
                      <div key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-[56px] h-[64px] rounded-xl bg-black/[0.04] overflow-hidden shrink-0">
                            {src ? <Image src={src} alt={item?.name || "Product"} fill className="object-cover" sizes="56px" /> : <div className="w-full h-full grid place-items-center text-[10px] text-gray-500">No image</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item?.name || "Product"}</p>
                            <p className="text-xs text-gray-600">Qty: {qty}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold tabular-nums shrink-0" style={{ color: BRAND }}>
                          ₹{money(price * qty)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-600">Your cart is empty.</p>
                )}
              </div>
            )}
          </GlassCard>

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
                              <CheckCircle2 className="w-4 h-4" style={{ color: BRAND }} />
                            ) : null
                          ) : null
                        }
                      />

                      <FormField label="Full Name" name="fullName" value={addressForm.fullName} onChange={updateAddressField} />
                      <FormField label="Phone" name="phone" value={addressForm.phone} onChange={updateAddressField} />

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

                      <FormField label="Address Line 1" name="addressLine1" value={addressForm.addressLine1} onChange={updateAddressField} />
                      <FormField label="Address Line 2" name="addressLine2" value={addressForm.addressLine2} onChange={updateAddressField} />

                      {/* NOTE: required fields are hidden & set from auth store */}
                      <input type="hidden" name="firebaseUID" value={addressForm.firebaseUID} readOnly />
                      <input type="hidden" name="email" value={addressForm.email} readOnly />
                      <input type="hidden" name="customerId" value={addressForm.customerId} readOnly />
                    </div>

                    <button
                      type="button"
                      onClick={saveNewAddress}
                      disabled={savingAddress}
                      className="mt-4 w-full rounded-2xl text-white py-3 text-sm font-semibold shadow-[0_14px_28px_rgba(128,0,32,0.22)] disabled:opacity-60 active:scale-[0.99] transition"
                      style={{ backgroundColor: BRAND }}
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
                <PayCard label="UPI (Soon)" value="upi" icon={<IndianRupee />} sub="Online will be enabled later" selected={selectedPayment} setSelected={setSelectedPayment} />
                <PayCard label="Card (Soon)" value="card" icon={<IndianRupee />} sub="Online will be enabled later" selected={selectedPayment} setSelected={setSelectedPayment} />
              </div>
            )}

            {showPayment && selectedPayment !== "cod" ? (
              <div className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-2xl px-4 py-3">
                Online payment will be enabled soon. Please select COD for now.
              </div>
            ) : null}
          </GlassCard>

          {/* 4) Total + CTA */}
          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Payment</div>
                <div className="text-2xl font-semibold text-gray-900 tabular-nums">₹{money(subtotal)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Shipping: <span className="text-green-700 font-semibold">Free</span>
                </div>
              </div>
              <Chip>
                <IndianRupee className="w-3.5 h-3.5" /> COD
              </Chip>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!items?.length || placing || selectedPayment !== "cod"}
              className="mt-4 w-full rounded-2xl py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(128,0,32,0.24)] active:scale-[0.99] transition disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {placing ? "Placing order..." : "Place Order (COD)"}
              <ArrowRight className="inline-block w-4 h-4 ml-2" />
            </button>

            <p className="mt-2 text-[11px] text-gray-500 leading-relaxed text-center">
              You’ll pay when the order is delivered.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
