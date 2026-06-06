"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Plus, ChevronDown, ChevronUp, CheckCircle2, Loader2 } from "lucide-react";


// ✅ double click guard
/* ---------------- UI ---------------- */
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`border border-neutral-200 bg-white shadow-[0_14px_38px_rgba(30,25,18,0.04)] ${className}`}
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
  disabled,
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-[9px] font-black uppercase tracking-[0.14em] text-black/42">{label}</label>

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          inputMode={inputMode}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-11 w-full border border-neutral-300 bg-[#fffefa] px-3 pr-12 text-[13px] font-bold uppercase tracking-[0.05em] text-black outline-none transition placeholder:font-bold placeholder:uppercase placeholder:text-black/28
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          ${
            error
              ? "border-red-500"
              : "focus:border-black"
          }`}
        />
        {rightNode ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightNode}</div>
        ) : null}
      </div>

      {error ? <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">{error}</p> : null}
    </div>
  );
}

/* ---------------- Validation ---------------- */
/* ---------------- Validation ---------------- */
const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

// ✅ NEW: normalize India phone (+91 / 91 / 0 prefix)
const normalizeIndianPhone = (input = "") => {
  let digits = String(input || "").replace(/\D/g, ""); // keep only numbers

  // If user typed 91XXXXXXXXXX (12 digits) or +91..., drop 91
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);

  // Optional: handle leading 0 (0XXXXXXXXXX)
  if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1);

  // If still longer than 10, keep last 10 digits
  if (digits.length > 10) digits = digits.slice(-10);

  return digits; // can be <10 while typing
};

// ✅ UPDATED: accepts 10-digit after normalization
const isValidPhone = (v = "") => /^[0-9]{10}$/.test(normalizeIndianPhone(v));

const isValidPassword = (v = "") => {
  const s = String(v);
  return s.length >= 6 && /[a-zA-Z]/.test(s) && /[0-9]/.test(s);
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

  // ✅ parent fetches addresses via customer.firebaseUID
  onCustomerFound,
}) {
  const isLoggedIn = !!user?.uid;

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const saveLockRef = useRef(false);

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [emailToCheck, setEmailToCheck] = useState("");

  const emailAbortRef = useRef(null);
  const showErr = (f) => submitted || touched[f];
useEffect(() => {
  // only for guest
  if (isLoggedIn) return;

  const emailOk = isValidEmail(addressForm.email);
  if (!emailOk) return;

  // don't toggle while api checking/loading addresses
  if (checkingEmail || loadingAddresses) return;

  // ✅ if no addresses, open form
  if (!addresses?.length) {
    setShowAddressForm(true);
  } else {
    setShowAddressForm(false);
  }
}, [
  isLoggedIn,
  addressForm.email,
  checkingEmail,
  loadingAddresses,
  addresses?.length,
]);

  /* ---------------- Errors ---------------- */
  const errors = useMemo(() => {
    const e = {};

    // Email is always required for guest
    if (!isLoggedIn && !isValidEmail(addressForm.email)) e.email = "Enter valid email";

    // Validations only when form is open
    if (showAddressForm) {
      if (!addressForm.fullName?.trim()) e.fullName = "Enter full name";
      if (!isValidPhone(addressForm.phone)) e.phone = "Phone must be 10 digits";
      if (!addressForm.postalCode || addressForm.postalCode.length !== 6) e.postalCode = "Enter valid pincode";
      if (!addressForm.city) e.city = "City required";
      if (!addressForm.state) e.state = "State required";
      if (!addressForm.addressLine1) e.addressLine1 = "Address line 1 required";
    }

    // Password only for NEW guest
    if (!isLoggedIn && !existingCustomer && showAddressForm) {
      if (!isValidPassword(guestInfo.password)) e.password = "Min 6 chars + 1 letter + 1 number";
    }

    return e;
  }, [addressForm, guestInfo.password, isLoggedIn, existingCustomer, showAddressForm]);

  const isFormValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  /* ---------------- Email suggestions ---------------- */
  const suggestedEmails = useMemo(() => {
    const v = String(addressForm.email || "");
    if (!v || v.includes("@")) return [];
    return ["@gmail.com", "@yahoo.com", "@outlook.com"].map((d) => v + d);
  }, [addressForm.email]);

  /* ---------------- Check customer exists ---------------- */
  const checkCustomerByEmail = async (email) => {
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!BACKEND) return;

      if (emailAbortRef.current) emailAbortRef.current.abort();
      const controller = new AbortController();
      emailAbortRef.current = controller;

      setCheckingEmail(true);

      const res = await fetch(
        `${BACKEND}/api/customers/exists?email=${encodeURIComponent(email)}`,
        { signal: controller.signal }
      );

      const data = await res.json();

      // ✅ Existing customer → load addresses silently, close form
      // ✅ Existing customer → load addresses; if none, open form (no password)
if (res.ok && data?.exists && data?.customer?.firebaseUID) {
  setExistingCustomer(true);
  setLoadingAddresses(true);

  await onCustomerFound?.(data.customer);

  setLoadingAddresses(false);
  return;
}



      // ✅ New customer → auto open form for address + password
      if (res.ok && data?.exists === false) {
        setExistingCustomer(false);
        setShowAddressForm(true); // ✅ AUTO OPEN FORM
        return;
      }

      setExistingCustomer(false);
    } catch (err) {
      if (err?.name !== "AbortError") setExistingCustomer(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  /* debounce check */
  useEffect(() => {
    if (!emailToCheck || !isValidEmail(emailToCheck)) return;
    const t = setTimeout(() => checkCustomerByEmail(emailToCheck), 600);
    return () => clearTimeout(t);
  }, [emailToCheck]);

  /* reset validation when opening form */
  useEffect(() => {
    if (!showAddressForm) return;
    setTouched({});
    setSubmitted(false);
  }, [showAddressForm]);

  /* ---------------- Render ---------------- */
  return (
    <GlassCard className="p-3.5 sm:p-4">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setShowAddress((s) => !s)}
        className="w-full flex items-center justify-between"
      >
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">Step 1</div>
          <div className="text-sm font-black uppercase tracking-[0.08em] text-black">Email & Address</div>
        </div>
        {showAddress ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* BODY */}
      {showAddress && (
        <div className="space-y-3 pt-3">
          {/* EMAIL (Guest) */}
          {!isLoggedIn && (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <FormField
                label="Email"
                name="email"
                value={addressForm.email}
               onChange={(e) => {
  updateAddressField(e);

  const val = String(e.target.value || "").trim().toLowerCase();

  // ✅ reset flags immediately on any email edit
  setExistingCustomer(false);
  setLoadingAddresses(false);

  if (isValidEmail(val)) setEmailToCheck(val);
  else setEmailToCheck("");
}}

                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="Enter email"
                inputMode="email"
                error={showErr("email") ? errors.email : ""}
                rightNode={
                  checkingEmail || loadingAddresses ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  ) : isValidEmail(addressForm.email) ? (
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  ) : null
                }
              />

              {suggestedEmails.length ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedEmails.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        updateAddressField({ target: { name: "email", value: em.toLowerCase() } });
                        setEmailToCheck(em.toLowerCase());
                      }}
                      className="border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-black/55 transition hover:border-black hover:text-black"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              ) : null}

              {loadingAddresses ? (
                <p className="text-[11px] text-gray-500 mt-2">Loading saved addresses…</p>
              ) : null}
            </div>
          )}

          {/* SAVED ADDRESSES */}
          {addresses.length ? (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const active = String(selectedAddressId) === String(addr?._id);
                return (
                  <label
                    key={addr._id}
                    className={`block cursor-pointer border p-3 transition sm:p-4 ${
                      active ? "border-black bg-white" : "border-neutral-200 bg-[#fbfaf7] hover:border-black hover:bg-white"
                    }`}
                    onClick={() => setSelectedAddressId(addr._id)}
                  >
                    <div className="flex items-start gap-3">
                      <input type="radio" readOnly checked={active} className="mt-1 h-4 w-4 accent-black" />
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.08em] text-black">{addr.fullName}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">{addr.phone}</p>
                        <p className="mt-2 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/55">
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
            <p className="border border-dashed border-neutral-300 bg-[#fbfaf7] p-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black/45">
              {isLoggedIn || existingCustomer ? "No saved addresses." : "Enter email to continue."}
            </p>
          )}

          {/* Add New Address (manual open) */}
          <button
            type="button"
            onClick={() => setShowAddressForm((s) => !s)}
            className="inline-flex h-10 items-center gap-2 bg-black px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
          >
            <Plus size={16} /> Add New Address
          </button>

          {/* FORM */}
          {showAddressForm && (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-black">New Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="PIN Code"
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
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
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

                {/* Password only if new guest */}
                {!isLoggedIn && !existingCustomer && (
                  <FormField
                    label="Password"
                    name="password"
                    type="password"
                    value={guestInfo.password}
                    onChange={updateGuestField}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    placeholder="Create password"
                    error={showErr("password") ? errors.password : ""}
                  />
                )}

                <FormField
  label="Phone"
  name="phone"
  value={addressForm.phone}
  onChange={(e) => {
    const raw = e.target.value || "";
    const normalized = normalizeIndianPhone(raw);

    // ✅ store only the normalized digits (max 10 eventually)
    updateAddressField({ target: { name: "phone", value: normalized } });
  }}
  onBlur={() => {
    // ✅ ensure final cleanup on blur (safety)
    const final10 = normalizeIndianPhone(addressForm.phone);
    updateAddressField({ target: { name: "phone", value: final10 } });
    setTouched((p) => ({ ...p, phone: true }));
  }}
  inputMode="numeric"
  placeholder="10-digit mobile (or +91 / 91)"
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
                  onBlur={() => setTouched((p) => ({ ...p, addressLine1: true }))}
                  error={showErr("addressLine1") ? errors.addressLine1 : ""}
                />

                <FormField
                  label="Address Line 2"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={updateAddressField}
                />
              </div>

              {/* CTA */}
             <button
  type="button"
  disabled={savingAddress || creatingGuest || checkingEmail || loadingAddresses}
  onClick={async () => {
    // ✅ block double click
    if (saveLockRef.current) {
      console.warn("⛔ Save blocked: already running");
      return;
    }
    saveLockRef.current = true;

    const traceId = `SAVE_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    console.groupCollapsed(`🟣 [${traceId}] Save Address Click`);
    console.log("state:", { isLoggedIn, existingCustomer, savingAddress, creatingGuest, checkingEmail, loadingAddresses });

    try {
      setSubmitted(true);
      if (!isFormValid) {
        console.warn(`🟡 [${traceId}] form invalid`, { errors });
        return;
      }

      // ✅ IMPORTANT: Only call parent. Parent handles guest create + address create.
      console.log(`🔵 [${traceId}] calling saveNewAddress`);
      const ok = await saveNewAddress();
      console.log(`🔵 [${traceId}] saveNewAddress result =>`, ok);

      if (!ok) console.warn(`❌ [${traceId}] saveNewAddress failed`);
    } catch (e) {
      console.error(`❌ [${traceId}] Save address flow failed:`, e);
      // optional:
      // toast.error("Address save failed");
    } finally {
      saveLockRef.current = false;
      console.groupEnd();
    }
  }}
  className="mt-4 h-11 w-full bg-black text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 disabled:bg-black/20 disabled:text-black/40"
>
  {checkingEmail || loadingAddresses
    ? "Checking..."
    : savingAddress || creatingGuest
    ? "Saving..."
    : "Save Address"}
</button>


              {!isFormValid && submitted && (
                <p className="mt-3 text-[11px] text-gray-500">Please fill required fields correctly.</p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
