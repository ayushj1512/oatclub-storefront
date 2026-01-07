"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ---------- UI bits ---------- */
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-[22px] bg-white/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </div>
);

function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  rightNode,
  inputMode,
  placeholder,
  error,
  type = "text",
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-600 mb-1">{label}</label>

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          inputMode={inputMode}
          placeholder={placeholder}
          className={`w-full rounded-2xl bg-white/80 px-4 py-3 pr-12 text-sm outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition 
          ${
            error
              ? "shadow-[inset_0_0_0_2px_rgba(220,38,38,0.45)]"
              : "focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.22)]"
          }
          `}
        />
        {rightNode ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightNode}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-[11px] text-red-600 mt-1">{error}</p> : null}
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
        @keyframes pinShimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        @keyframes pinDot {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.55;
          }
          50% {
            transform: translateY(-2px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- Validation helpers ---------- */
const isValidEmail = (v = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

const isValidPhone = (v = "") => /^[0-9]{10}$/.test(String(v));

const isValidPassword = (v = "") => {
  const s = String(v);
  if (s.length < 6) return false;
  if (!/[a-zA-Z]/.test(s)) return false;
  if (!/[0-9]/.test(s)) return false;
  return true;
};

export default function AddressSelection({
  addresses = [],
  selectedAddressId,
  setSelectedAddressId,
  showAddress,
  setShowAddress,

  showAddressForm,
  setShowAddressForm,

  addressForm,
  updateAddressField,
  saveNewAddress,

  pinLoading,

  savingAddress,
  creatingGuest,

  guestInfo,
  updateGuestField,

  user,
}) {
  const isLoggedIn = !!user?.uid;

  /* ============================================================
     ✅ Local UI states
  ============================================================ */
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState(false);
  const [emailToCheck, setEmailToCheck] = useState("");

  const emailAbortRef = useRef(null);

  const showErr = (field) => submitted || touched[field];

  /* ============================================================
     ✅ Live Errors
  ============================================================ */
  const errors = useMemo(() => {
    const e = {};

    if (!addressForm.fullName || addressForm.fullName.trim().length < 2)
      e.fullName = "Enter full name";

    if (!isValidPhone(addressForm.phone))
      e.phone = "Phone must be 10 digits";

    if (!addressForm.postalCode || addressForm.postalCode.length !== 6)
      e.postalCode = "Enter valid 6-digit pincode";

    if (!addressForm.city) e.city = "City required";
    if (!addressForm.state) e.state = "State required";
    if (!addressForm.addressLine1) e.addressLine1 = "Address line 1 required";

    if (!isLoggedIn) {
      if (!isValidEmail(addressForm.email)) e.email = "Enter valid email";

      if (!isValidPassword(guestInfo.password))
        e.password = "Password min 6 chars + 1 letter + 1 number";
    }

    return e;
  }, [addressForm, guestInfo.password, isLoggedIn]);

  const isFormValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  /* ============================================================
     ✅ Email Suggestions
  ============================================================ */
  const domains = ["@gmail.com", "@yahoo.com", "@outlook.com"];
  const emailValue = String(addressForm.email || "");

  const suggestedEmails = useMemo(() => {
    if (!emailValue || emailValue.includes("@")) return [];
    return domains.map((d) => emailValue + d);
  }, [emailValue]);

  /* ============================================================
     ✅ Check Customer by Email (Abort + Debounce Safe)
  ============================================================ */
  const checkCustomerByEmail = async (email) => {
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!BACKEND) return;

      // ✅ Abort previous request if any
      if (emailAbortRef.current) {
        emailAbortRef.current.abort();
      }

      const controller = new AbortController();
      emailAbortRef.current = controller;

      setCheckingEmail(true);

      const res = await fetch(
        `${BACKEND}/api/customers?email=${encodeURIComponent(email)}`,
        { signal: controller.signal }
      );

      const data = await res.json();

      if (res.ok && data?.items?.length > 0) {
        setExistingCustomer(true);
      } else {
        setExistingCustomer(false);
      }
    } catch (err) {
      if (err?.name === "AbortError") return; // ✅ ignore abort
      console.log("❌ Email check failed", err);
      setExistingCustomer(false);
    } finally {
      setCheckingEmail(false);
    }
  };
useEffect(() => {
  if (showAddressForm) {
    resetFormUI();
  }
}, [showAddressForm]);

useEffect(() => {
  resetFormUI();
}, [showAddressForm]);

  // ✅ Debounce: runs only when emailToCheck changes
  useEffect(() => {
    if (!emailToCheck || !isValidEmail(emailToCheck)) return;

    const timer = setTimeout(() => {
      checkCustomerByEmail(emailToCheck);
    }, 600);

    return () => clearTimeout(timer);
  }, [emailToCheck]);

  /* ============================================================
     ✅ Reset helper
  ============================================================ */
  const resetFormUI = () => {
    setTouched({});
    setSubmitted(false);
    setCheckingEmail(false);
    setExistingCustomer(false);
    setEmailToCheck("");

    if (emailAbortRef.current) {
      emailAbortRef.current.abort();
      emailAbortRef.current = null;
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setShowAddress((s) => !s)}
        className="w-full flex items-center justify-between"
      >
        <div className="min-w-0">
          <div className="text-sm text-gray-500">Step 2</div>
          <div className="text-lg font-semibold text-gray-900">
            Delivery Address
          </div>
        </div>
        {showAddress ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* BODY */}
      {showAddress && (
        <div className="pt-4 space-y-4">
          {/* SAVED ADDRESS LIST */}
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
                      <input
                        type="radio"
                        readOnly
                        checked={active}
                        className="mt-1 w-5 h-5 accent-black"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {addr.fullName}
                        </p>
                        <p className="text-xs text-gray-600">{addr.phone}</p>
                        <p className="text-sm text-gray-700 mt-1 leading-5">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""},{" "}
                          {addr.city}, {addr.state} - {addr.postalCode}
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

          {/* ADD NEW ADDRESS BUTTON */}
         <button
  type="button"
  onClick={() => setShowAddressForm((s) => !s)}
  className="inline-flex items-center gap-2 rounded-2xl bg-black text-white px-4 py-2 text-sm font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.18)] active:scale-[0.99] transition"
>
  <Plus size={16} /> Add New Address
</button>


          {/* ADDRESS FORM */}
          {showAddressForm && (
            <div className="rounded-2xl bg-white/70 p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
              <h3 className="font-semibold text-gray-900 mb-3">New Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="PIN Code (enter first)"
                  name="postalCode"
                  value={addressForm.postalCode}
                  onChange={updateAddressField}
                  onBlur={() => setTouched((p) => ({ ...p, postalCode: true }))}
                  inputMode="numeric"
                  placeholder="6-digit pincode"
                  error={showErr("postalCode") ? errors.postalCode : ""}
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
                  onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                  error={showErr("fullName") ? errors.fullName : ""}
                />

                {!isLoggedIn && (
                  <>
                    <div>
                      <FormField
                        label="Email"
                        name="email"
                        value={addressForm.email}
                        onChange={(e) => {
                          updateAddressField(e);

                          const val = String(e.target.value || "")
                            .trim()
                            .toLowerCase();

                          if (isValidEmail(val)) {
                            setEmailToCheck(val); // ✅ debounce trigger
                          } else {
                            setEmailToCheck("");
                            setExistingCustomer(false);
                          }
                        }}
                        onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                        placeholder="Enter email"
                        inputMode="email"
                        error={showErr("email") ? errors.email : ""}
                        rightNode={
                          checkingEmail ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                          ) : existingCustomer ? (
                            <span className="text-[11px] font-semibold text-red-600">
                              Exists
                            </span>
                          ) : isValidEmail(addressForm.email) ? (
                            <CheckCircle2 className="w-4 h-4 text-black" />
                          ) : null
                        }
                      />

                      {existingCustomer && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                          <p className="text-xs font-semibold text-red-700">
                            You are already registered.
                          </p>
                          <p className="text-[11px] text-red-600 mt-1">
                            Please login to continue checkout.
                          </p>

                          <button
                            type="button"
                            className="mt-3 w-full rounded-lg bg-black text-white py-2 text-sm font-semibold hover:bg-black/90 transition"
                            onClick={() => {
                              window.location.href = `/auth/login?email=${encodeURIComponent(
                                addressForm.email
                              )}`;
                            }}
                          >
                            Login Now
                          </button>
                        </div>
                      )}

                      {suggestedEmails.length ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {suggestedEmails.map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => {
                                updateAddressField({
                                  target: {
                                    name: "email",
                                    value: em.toLowerCase(),
                                  },
                                });
                                setEmailToCheck(em.toLowerCase());
                              }}
                              className="text-[11px] px-3 py-1 rounded-full bg-black/5 hover:bg-black hover:text-white transition"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <FormField
                      label="Password"
                      name="password"
                      type="password"
                      value={guestInfo.password}
                      onChange={updateGuestField}
                      onBlur={() =>
                        setTouched((p) => ({ ...p, password: true }))
                      }
                      placeholder="Create password"
                      error={showErr("password") ? errors.password : ""}
                    />
                  </>
                )}

                <FormField
                  label="Phone"
                  name="phone"
                  value={addressForm.phone}
                  onChange={(e) => {
                    const cleaned = String(e.target.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    updateAddressField({
                      target: { name: "phone", value: cleaned },
                    });
                  }}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  error={showErr("phone") ? errors.phone : ""}
                />

                <FormField
                  label="City"
                  name="city"
                  value={addressForm.city}
                  onChange={updateAddressField}
                  onBlur={() => setTouched((p) => ({ ...p, city: true }))}
                  placeholder={pinLoading ? "Auto-filling…" : "City"}
                  error={showErr("city") ? errors.city : ""}
                />

                <FormField
                  label="State"
                  name="state"
                  value={addressForm.state}
                  onChange={updateAddressField}
                  onBlur={() => setTouched((p) => ({ ...p, state: true }))}
                  placeholder={pinLoading ? "Auto-filling…" : "State"}
                  error={showErr("state") ? errors.state : ""}
                />

                <FormField
                  label="Address Line 1"
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={updateAddressField}
                  onBlur={() =>
                    setTouched((p) => ({ ...p, addressLine1: true }))
                  }
                  error={showErr("addressLine1") ? errors.addressLine1 : ""}
                />

                <FormField
                  label="Address Line 2"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={updateAddressField}
                />
              </div>

              {/* SAVE BUTTON */}
              <button
                type="button"
                disabled={
                  savingAddress ||
                  creatingGuest ||
                  existingCustomer ||
                  checkingEmail
                }
                onClick={async () => {
                  setSubmitted(true);

                  if (existingCustomer) {
                    window.location.href = `/auth/login?email=${encodeURIComponent(
                      addressForm.email || ""
                    )}`;
                    return;
                  }

                  if (!isFormValid) return;
                  await saveNewAddress();
                }}
                className="mt-4 w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition hover:opacity-90 disabled:bg-black/20 disabled:text-black/40 active:scale-[0.99]"
              >
                {checkingEmail
                  ? "Checking..."
                  : savingAddress || creatingGuest
                  ? "Saving..."
                  : existingCustomer
                  ? "Already registered — Login"
                  : "Save Address"}
              </button>

              {!isFormValid && submitted && (
                <p className="mt-3 text-[11px] text-gray-500">
                  Please fill all required fields correctly to continue.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
