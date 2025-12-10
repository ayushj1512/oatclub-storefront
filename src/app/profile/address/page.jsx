// src/app/profile/address/page.jsx
"use client";

/**
 * iOS-style + FLEX layout (no max-width)
 * - Saved addresses on TOP
 * - Add form below
 * - PINCODE FIRST + premium loader
 * - Uses usePincodeLookup (no error text if pincode not found)
 */

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, MapPin, Plus, CheckCircle2, Loader2, Home, Building2, BadgeCheck } from "lucide-react";
import { usePincodeLookup } from "@/utils/usePincodeLookup";

const BRAND = "#800020";

export default function AddressBookPage() {
  const router = useRouter();
  const { user, customer } = useAuthStore();
  const { addresses, fetchAddresses, createAddress } = useAddressStore();
  const [saving, setSaving] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    alternatePhone: "",
    postalCode: "",
    city: "",
    state: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    addressType: "home",
    firebaseUID: "",
    email: "",
    customerId: "",
    isDefaultShipping: false,
  });

  // pincode lookup (no error UI)
  const pin = String(formData.postalCode || "");
  const { loading: pinLoading, data: pinData } = usePincodeLookup(pin);
  const pinValid = useMemo(() => /^\d{6}$/.test(pin), [pin]);
  const filledByPin = !!(pinData?.city || pinData?.state);

  // init: load addresses + prefill user info
  useEffect(() => {
    if (!user) return;
    fetchAddresses(user.uid);
    setFormData((p) => ({
      ...p,
      fullName: customer?.name || user?.name || "",
      phone: customer?.phone || "",
      firebaseUID: user.uid,
      email: user.email || "",
      customerId: customer?._id || "",
    }));
  }, [user, customer, fetchAddresses]);

  // autofill on success
  useEffect(() => {
    if (!pinData) return;
    setFormData((p) => ({
      ...p,
      city: pinData.city || p.city,
      state: pinData.state || p.state,
    }));
  }, [pinData]);

  // update fields (sanitize pincode)
  const updateField = (e) => {
    const { name, value } = e.target;
    if (name === "postalCode") {
      const cleaned = String(value || "").replace(/\D/g, "").slice(0, 6);
      setFormData((p) => ({ ...p, postalCode: cleaned }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // save
  const saveAddress = async () => {
    setSaving(true);
    try {
      await createAddress(formData);
      if (user?.uid) await fetchAddresses(user.uid);
      // keep name/phone; clear rest
      setFormData((p) => ({
        ...p,
        alternatePhone: "",
        postalCode: "",
        city: "",
        state: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        addressType: "home",
        isDefaultShipping: false,
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F2F2F7]">
      <IOSStyles />

      {/* ✅ FULL-WIDTH flex container (no max-width) */}
      <div className="w-full flex flex-col gap-5 px-4 sm:px-6 lg:px-10 py-7 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/profile")} className="ios-icon-btn" aria-label="Back">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 truncate">My Addresses</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Enter pincode first — auto-fill when available.
            </p>
          </div>
        </div>

        {/* ✅ Saved addresses (top) */}
        <IOSCard
          title="Saved Addresses"
          icon={<MapPin size={16} style={{ color: BRAND }} />}
          right={<span className="ios-subtle">{addresses?.length || 0} saved</span>}
        >
          {addresses?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <AddressCard key={addr._id} addr={addr} />
              ))}
            </div>
          ) : (
            <div className="ios-empty">No saved addresses yet.</div>
          )}
        </IOSCard>

        {/* ✅ Add form (bottom) */}
        <IOSCard
          title="Add New Address"
          icon={<Plus size={16} style={{ color: BRAND }} />}
          right={<PinStatus pinValid={pinValid} loading={pinLoading} filled={filledByPin} />}
        >
          {/* PINCODE FIRST */}
          <IOSInput
            label="Pincode (enter first)"
            name="postalCode"
            value={formData.postalCode}
            onChange={updateField}
            placeholder="6-digit pincode"
            rightNode={
              pinValid ? (
                pinLoading ? (
                  <PremiumLoader />
                ) : filledByPin ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: BRAND }} />
                ) : null
              ) : null
            }
          />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IOSInput label="Full Name" name="fullName" value={formData.fullName} onChange={updateField} />
            <IOSInput label="Phone" name="phone" value={formData.phone} onChange={updateField} />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IOSInput
              label="Alternate Phone"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={updateField}
              placeholder="Optional"
            />
            <IOSSelect label="Address Type" name="addressType" value={formData.addressType} onChange={updateField}>
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="other">Other</option>
            </IOSSelect>
          </div>

          {/* Autofill fields (always editable; no error UI) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IOSInput
              label="City"
              name="city"
              value={formData.city}
              onChange={updateField}
              placeholder={pinLoading ? "Auto-filling…" : "City"}
            />
            <IOSInput
              label="State"
              name="state"
              value={formData.state}
              onChange={updateField}
              placeholder={pinLoading ? "Auto-filling…" : "State"}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <IOSInput
              label="Address Line 1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={updateField}
              placeholder="House no, Street, Area"
            />
            <IOSInput
              label="Address Line 2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={updateField}
              placeholder="Apartment, Floor (optional)"
            />
            <IOSInput
              label="Landmark"
              name="landmark"
              value={formData.landmark}
              onChange={updateField}
              placeholder="Optional"
            />
          </div>

          {/* Default toggle */}
          <label className="mt-4 ios-toggle">
            <input
              type="checkbox"
              checked={!!formData.isDefaultShipping}
              onChange={(e) => setFormData((p) => ({ ...p, isDefaultShipping: e.target.checked }))}
              className="ios-checkbox"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">Set as default shipping</div>
              <div className="text-[11px] text-gray-600">Use this address by default at checkout.</div>
            </div>
          </label>

          <button onClick={saveAddress} disabled={saving} className="mt-5 ios-primary-btn" style={{ backgroundColor: BRAND }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Address"}
          </button>
        </IOSCard>
      </div>
    </section>
  );
}

/* ---------- small UI parts ---------- */

function IOSCard({ title, icon, right, children }) {
  return (
    <div className="ios-card">
      <div className="ios-card-header">
        <div className="flex items-center gap-2 min-w-0">
          <div className="ios-icon">{icon}</div>
          <div className="ios-title truncate">{title}</div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="ios-card-body">{children}</div>
    </div>
  );
}

function AddressCard({ addr }) {
  const type = String(addr.addressType || "home").toLowerCase();
  const Icon = type === "office" ? Building2 : Home;

  return (
    <div className="ios-address">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ios-pill">
              <Icon className="w-3.5 h-3.5" />
              <span className="uppercase">{type}</span>
            </span>
            {addr.isDefaultShipping ? (
              <span className="ios-pill ios-pill-good">
                <BadgeCheck className="w-3.5 h-3.5" />
                Default
              </span>
            ) : null}
          </div>

          <div className="mt-3 font-semibold text-gray-900 truncate">{addr.fullName}</div>
          <div className="text-sm text-gray-700">{addr.phone}</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700 leading-5">
        {addr.addressLine1}
        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
        {addr.landmark ? `, ${addr.landmark}` : ""}
        <br />
        {addr.city}, {addr.state} - {addr.postalCode}
      </div>
    </div>
  );
}

function IOSInput({ label, rightNode, ...props }) {
  return (
    <div className="flex flex-col w-full">
      <label className="ios-label">{label}</label>
      <div className="relative">
        <input {...props} className="ios-input pr-14" />
        {rightNode ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightNode}</div> : null}
      </div>
    </div>
  );
}

function IOSSelect({ label, children, ...props }) {
  return (
    <div className="flex flex-col w-full">
      <label className="ios-label">{label}</label>
      <select {...props} className="ios-input">
        {children}
      </select>
    </div>
  );
}

function PinStatus({ pinValid, loading, filled }) {
  if (!pinValid) return <span className="ios-subtle"> </span>;
  if (loading) return <span className="ios-subtle">Auto-filling…</span>;
  if (filled) return <span className="ios-good">Auto-filled</span>;
  return <span className="ios-subtle"> </span>; // no "not found" msg
}

/**
 * ✅ Premium Loader (short + iOS feel)
 * - shimmer bar + breathing glow + 3 dots + tiny spinner
 */
function PremiumLoader() {
  return (
    <div className="flex items-center gap-2">
      <span className="ios-shimmer2" />
      <span className="ios-dots2">
        <i />
        <i />
        <i />
      </span>
      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
    </div>
  );
}

function IOSStyles() {
  return (
    <style jsx global>{`
      .ios-card {
        border-radius: 22px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        backdrop-filter: blur(10px);
      }
      .ios-card-header {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        background: rgba(255, 255, 255, 0.75);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .ios-card-body { padding: 16px; }
      .ios-title { font-size: 16px; font-weight: 800; color: #111827; }
      .ios-icon {
        width: 34px; height: 34px; border-radius: 16px;
        border: 1px solid rgba(0,0,0,0.08);
        background: rgba(0,0,0,0.03);
        display: grid; place-items: center;
      }
      .ios-icon-btn {
        width: 40px; height: 40px; border-radius: 16px;
        border: 1px solid rgba(0,0,0,0.1);
        background: rgba(255,255,255,0.85);
        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        transition: 160ms ease;
      }
      .ios-icon-btn:hover { transform: translateY(-1px); }
      .ios-label { font-size: 12px; color: rgba(17,24,39,0.62); margin-bottom: 6px; font-weight: 700; }
      .ios-input {
        width: 100%;
        padding: 12px 12px;
        border-radius: 16px;
        border: 1px solid rgba(0,0,0,0.10);
        background: rgba(255,255,255,0.92);
        font-size: 14px;
        color: #111827;
        outline: none;
        transition: 160ms ease;
      }
      .ios-input:focus {
        border-color: rgba(0,0,0,0.18);
        box-shadow: 0 0 0 4px rgba(0,0,0,0.06);
      }
      .ios-primary-btn {
        width: 100%;
        padding: 12px 14px;
        border-radius: 18px;
        color: white;
        font-weight: 800;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 18px 40px rgba(0,0,0,0.16);
        transition: 160ms ease;
      }
      .ios-primary-btn:hover { transform: translateY(-1px); }
      .ios-primary-btn:active { transform: scale(0.99); }
      .ios-primary-btn:disabled { opacity: 0.75; }

      .ios-toggle {
        border-radius: 18px;
        border: 1px solid rgba(0,0,0,0.08);
        background: rgba(0,0,0,0.02);
        padding: 12px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .ios-checkbox { width: 16px; height: 16px; }
      .ios-subtle { font-size: 11px; color: rgba(17,24,39,0.5); font-weight: 700; }
      .ios-good { font-size: 11px; color: rgba(21,128,61,0.95); font-weight: 800; }

      .ios-empty {
        border-radius: 18px;
        border: 1px solid rgba(0,0,0,0.08);
        background: rgba(0,0,0,0.02);
        padding: 14px;
        font-size: 14px;
        color: rgba(17,24,39,0.7);
      }
      .ios-address {
        border-radius: 20px;
        border: 1px solid rgba(0,0,0,0.08);
        background: rgba(255,255,255,0.92);
        padding: 14px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.06);
        transition: 160ms ease;
      }
      .ios-address:hover { transform: translateY(-1px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
      .ios-pill {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 10px; border-radius: 999px;
        font-size: 10px; font-weight: 900; letter-spacing: 0.05em;
        border: 1px solid rgba(0,0,0,0.08);
        background: rgba(0,0,0,0.03);
        color: rgba(17,24,39,0.72);
      }
      .ios-pill-good {
        border-color: rgba(34,197,94,0.25);
        background: rgba(34,197,94,0.10);
        color: rgba(21,128,61,0.95);
      }

      /* Premium loader */
      .ios-shimmer2{
        width: 54px; height: 18px; border-radius: 999px;
        border: 1px solid rgba(0,0,0,0.08);
        background: rgba(0,0,0,0.04);
        position: relative; overflow: hidden;
        box-shadow: 0 0 0 0 rgba(128,0,32,0.0);
        animation: iosGlow 1.2s ease-in-out infinite;
      }
      .ios-shimmer2::after{
        content:"";
        position:absolute; inset:0;
        transform: translateX(-120%);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
        animation: iosShimmer2 1.0s infinite;
      }
      @keyframes iosShimmer2{ 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }
      @keyframes iosGlow{
        0%,100%{ box-shadow: 0 0 0 0 rgba(128,0,32,0.0); }
        50%{ box-shadow: 0 0 0 6px rgba(128,0,32,0.06); }
      }
      .ios-dots2{ display:inline-flex; gap:4px; align-items:center; }
      .ios-dots2 i{
        width: 5px; height: 5px; border-radius: 999px;
        background: rgba(17,24,39,0.35);
        animation: iosDot2 0.85s infinite ease-in-out;
        display:block;
      }
      .ios-dots2 i:nth-child(2){ animation-delay: 0.12s; }
      .ios-dots2 i:nth-child(3){ animation-delay: 0.24s; }
      @keyframes iosDot2{
        0%,100%{ transform: translateY(0); opacity: 0.55; }
        50%{ transform: translateY(-3px); opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce){
        .ios-primary-btn:hover, .ios-address:hover{ transform:none; }
        .ios-shimmer2, .ios-shimmer2::after, .ios-dots2 i{ animation:none !important; }
      }
    `}</style>
  );
}
