"use client";

import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
} from "lucide-react";

/* =========================================================
   UI
========================================================= */

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
  disabled = false,
  autoComplete,
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-[9px] font-black uppercase tracking-[0.14em] text-black/42">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          inputMode={inputMode}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`h-11 w-full border bg-[#fffefa] px-3 pr-12 text-[13px] font-bold tracking-[0.04em] text-black outline-none transition placeholder:font-bold placeholder:uppercase placeholder:text-black/28 ${
            disabled
              ? "cursor-not-allowed border-neutral-200 opacity-60"
              : error
                ? "border-red-500"
                : "border-neutral-300 focus:border-black"
          }`}
        />

        {rightNode ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightNode}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* =========================================================
   VALIDATION
========================================================= */

const normalizeEmail = (value = "") =>
  String(value).trim().toLowerCase();

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalizeEmail(value),
  );

const normalizeIndianPhone = (input = "") => {
  let digits = String(input || "").replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }

  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  return digits;
};

const isValidPhone = (value = "") =>
  /^[0-9]{10}$/.test(normalizeIndianPhone(value));

/* =========================================================
   COMPONENT
========================================================= */

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

  user,
  customer,
}) {
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const saveLockRef = useRef(false);

  const isAuthenticated = Boolean(
    customer?._id && user,
  );

  /*
   * Guest checkout never receives saved addresses.
   * Parent should only fetch addresses for authenticated customers.
   */
  const visibleAddresses = isAuthenticated
    ? addresses
    : [];

  const errors = useMemo(() => {
    const nextErrors = {};

    if (!isAuthenticated && !isValidEmail(addressForm.email)) {
      nextErrors.email = "Enter valid email";
    }

    if (!showAddressForm) {
      return nextErrors;
    }

    if (!addressForm.fullName?.trim()) {
      nextErrors.fullName = "Enter full name";
    }

    if (!isValidPhone(addressForm.phone)) {
      nextErrors.phone = "Phone must be 10 digits";
    }

    if (
      !addressForm.postalCode ||
      String(addressForm.postalCode).length !== 6
    ) {
      nextErrors.postalCode = "Enter valid pincode";
    }

    if (!addressForm.city?.trim()) {
      nextErrors.city = "City required";
    }

    if (!addressForm.state?.trim()) {
      nextErrors.state = "State required";
    }

    if (!addressForm.addressLine1?.trim()) {
      nextErrors.addressLine1 =
        "Address line 1 required";
    }

    return nextErrors;
  }, [
    addressForm,
    isAuthenticated,
    showAddressForm,
  ]);

  const isFormValid =
    Object.keys(errors).length === 0;

  const showError = (field) =>
    submitted || touched[field];

  const suggestedEmails = useMemo(() => {
    if (isAuthenticated) return [];

    const value = String(
      addressForm.email || "",
    ).trim();

    if (!value || value.includes("@")) {
      return [];
    }

    return [
      `${value}@gmail.com`,
      `${value}@yahoo.com`,
      `${value}@outlook.com`,
    ];
  }, [addressForm.email, isAuthenticated]);

  const handlePhoneChange = (event) => {
    const phone = normalizeIndianPhone(
      event.target.value,
    );

    updateAddressField({
      target: {
        name: "phone",
        value: phone,
      },
    });
  };

  const handleEmailChange = (event) => {
    updateAddressField({
      target: {
        name: "email",
        value: normalizeEmail(
          event.target.value,
        ),
      },
    });
  };

  const handleOpenForm = () => {
    setTouched({});
    setSubmitted(false);

    setShowAddressForm((current) => !current);
  };

  const handleSaveAddress = async () => {
    if (saveLockRef.current) return;

    setSubmitted(true);

    if (!isFormValid) return;

    saveLockRef.current = true;

    try {
      await saveNewAddress();
    } finally {
      saveLockRef.current = false;
    }
  };

  return (
    <GlassCard className="p-3.5 sm:p-4">
      <button
        type="button"
        onClick={() =>
          setShowAddress((current) => !current)
        }
        className="flex w-full items-center justify-between"
      >
        <div className="min-w-0 text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">
            Step 1
          </p>

          <p className="text-sm font-black uppercase tracking-[0.08em] text-black">
            Email & Delivery Address
          </p>
        </div>

        {showAddress ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {showAddress ? (
        <div className="space-y-3 pt-3">
          {/* Account / guest identity */}
          {isAuthenticated ? (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-black/38">
                Ordering as
              </p>

              <p className="mt-1 text-xs font-black uppercase tracking-[0.06em] text-black">
                {customer?.name ||
                  customer?.email ||
                  "OATCLUB Member"}
              </p>

              {customer?.email ? (
                <p className="mt-1 break-all text-[10px] font-bold tracking-[0.05em] text-black/45">
                  {customer.email}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={addressForm.email}
                onChange={handleEmailChange}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    email: true,
                  }))
                }
                inputMode="email"
                autoComplete="email"
                placeholder="Enter email address"
                error={
                  showError("email")
                    ? errors.email
                    : ""
                }
                rightNode={
                  isValidEmail(addressForm.email) ? (
                    <CheckCircle2 className="h-4 w-4 text-black" />
                  ) : null
                }
              />

              {suggestedEmails.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestedEmails.map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          updateAddressField({
                            target: {
                              name: "email",
                              value: suggestion,
                            },
                          })
                        }
                        className="border border-neutral-200 bg-white px-3 py-1.5 text-[9px] font-black tracking-[0.08em] text-black/55 transition hover:border-black hover:text-black"
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
              ) : null}

              <p className="mt-2 text-[9px] font-bold uppercase leading-4 tracking-[0.06em] text-black/38">
                Use this email later to sign in and
                view your order updates.
              </p>
            </div>
          )}

          {/* Authenticated saved addresses */}
          {visibleAddresses.length ? (
            <div className="space-y-3">
              {visibleAddresses.map((address) => {
                const active =
                  String(selectedAddressId) ===
                  String(address?._id);

                return (
                  <label
                    key={address._id}
                    onClick={() =>
                      setSelectedAddressId(
                        address._id,
                      )
                    }
                    className={`block cursor-pointer border p-3 transition sm:p-4 ${
                      active
                        ? "border-black bg-white"
                        : "border-neutral-200 bg-[#fbfaf7] hover:border-black hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        readOnly
                        checked={active}
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.08em] text-black">
                          {address.fullName}
                        </p>

                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">
                          {address.phone}
                        </p>

                        <p className="mt-2 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/55">
                          {address.addressLine1}

                          {address.addressLine2
                            ? `, ${address.addressLine2}`
                            : ""}

                          , {address.city},{" "}
                          {address.state} -{" "}
                          {address.postalCode ||
                            address.pincode}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : isAuthenticated ? (
            <p className="border border-dashed border-neutral-300 bg-[#fbfaf7] p-3 text-[10px] font-bold uppercase tracking-[0.1em] text-black/45">
              No saved addresses yet.
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex h-10 items-center gap-2 bg-black px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />

            {showAddressForm
              ? "Close Address Form"
              : visibleAddresses.length
                ? "Add New Address"
                : "Enter Delivery Address"}
          </button>

          {showAddressForm ? (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-black">
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="PIN Code"
                  name="postalCode"
                  value={addressForm.postalCode}
                  onChange={updateAddressField}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      postalCode: true,
                    }))
                  }
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="6-digit pincode"
                  error={
                    showError("postalCode")
                      ? errors.postalCode
                      : ""
                  }
                  rightNode={
                    String(
                      addressForm.postalCode || "",
                    ).length === 6 ? (
                      pinLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                      ) : addressForm.city ||
                        addressForm.state ? (
                        <CheckCircle2 className="h-4 w-4 text-black" />
                      ) : null
                    ) : null
                  }
                />

                <FormField
                  label="Full Name"
                  name="fullName"
                  value={addressForm.fullName}
                  onChange={updateAddressField}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      fullName: true,
                    }))
                  }
                  autoComplete="name"
                  placeholder="Full name"
                  error={
                    showError("fullName")
                      ? errors.fullName
                      : ""
                  }
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={addressForm.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => {
                    updateAddressField({
                      target: {
                        name: "phone",
                        value:
                          normalizeIndianPhone(
                            addressForm.phone,
                          ),
                      },
                    });

                    setTouched((current) => ({
                      ...current,
                      phone: true,
                    }));
                  }}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  error={
                    showError("phone")
                      ? errors.phone
                      : ""
                  }
                />

                <FormField
                  label="City"
                  name="city"
                  value={addressForm.city}
                  onChange={updateAddressField}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      city: true,
                    }))
                  }
                  autoComplete="address-level2"
                  placeholder={
                    pinLoading
                      ? "Auto-filling..."
                      : "City"
                  }
                  error={
                    showError("city")
                      ? errors.city
                      : ""
                  }
                />

                <FormField
                  label="State"
                  name="state"
                  value={addressForm.state}
                  onChange={updateAddressField}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      state: true,
                    }))
                  }
                  autoComplete="address-level1"
                  placeholder={
                    pinLoading
                      ? "Auto-filling..."
                      : "State"
                  }
                  error={
                    showError("state")
                      ? errors.state
                      : ""
                  }
                />

                <FormField
                  label="Address Line 1"
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={updateAddressField}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      addressLine1: true,
                    }))
                  }
                  autoComplete="address-line1"
                  placeholder="House, building, street"
                  error={
                    showError("addressLine1")
                      ? errors.addressLine1
                      : ""
                  }
                />

                <FormField
                  label="Address Line 2"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={updateAddressField}
                  autoComplete="address-line2"
                  placeholder="Area, landmark, optional"
                />
              </div>

              <button
                type="button"
                disabled={savingAddress}
                onClick={handleSaveAddress}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/40"
              >
                {savingAddress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}

                {savingAddress
                  ? "Saving Address"
                  : "Save & Use Address"}
              </button>

              {!isFormValid && submitted ? (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.06em] text-red-600">
                  Please fill all required fields
                  correctly.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </GlassCard>
  );
}