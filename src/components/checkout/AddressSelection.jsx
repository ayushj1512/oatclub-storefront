"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
} from "lucide-react";

const normalizeEmail = (value = "") =>
  String(value).trim().toLowerCase();

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const normalizePhone = (value = "") => {
  let digits = String(value).replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }

  return digits.slice(-10);
};

const isValidPhone = (value = "") =>
  /^[0-9]{10}$/.test(normalizePhone(value));

const Card = ({ children, className = "" }) => (
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
  placeholder,
  error,
  type = "text",
  inputMode,
  autoComplete,
  rightNode,
}) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-black/42">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={`h-11 w-full border bg-[#fffefa] px-3 pr-11 text-[13px] font-bold tracking-[0.04em] text-black outline-none transition placeholder:uppercase placeholder:text-black/28 ${error
              ? "border-red-500"
              : "border-neutral-300 focus:border-black"
            }`}
        />

        {rightNode && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightNode}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

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

  pinLoading = false,

  user,
  customer,
}) {
  const [touched, setTouched] = useState({});


  const visibleAddresses =
  customer?._id &&
  Array.isArray(addresses)
    ? addresses
    : [];

const hasSavedAddresses =
  visibleAddresses.length > 0;

  useEffect(() => {
    if (!hasSavedAddresses) {
      setSelectedAddressId(null);
      setShowAddressForm(true);
      return;
    }

    const selectedExists = visibleAddresses.some(
      (address) => String(address._id) === String(selectedAddressId),
    );

    if (!selectedExists) {
      setSelectedAddressId(visibleAddresses[0]._id);
    }
  }, [
    hasSavedAddresses,
    visibleAddresses,
    selectedAddressId,
    setSelectedAddressId,
    setShowAddressForm,
  ]);

  const errors = useMemo(() => {
    const next = {};

    if (
      !customer?.email &&
      !isValidEmail(addressForm.email)
    ) {
      next.email = "Enter a valid email";
    }

    if (showAddressForm) {
      if (!addressForm.fullName?.trim()) {
        next.fullName = "Full name is required";
      }

      if (!isValidPhone(addressForm.phone)) {
        next.phone = "Enter a valid 10-digit phone";
      }

      if (!/^[0-9]{6}$/.test(String(addressForm.postalCode || ""))) {
        next.postalCode = "Enter a valid 6-digit PIN code";
      }

      if (!addressForm.city?.trim()) {
        next.city = "City is required";
      }

      if (!addressForm.state?.trim()) {
        next.state = "State is required";
      }

      if (!addressForm.addressLine1?.trim()) {
        next.addressLine1 = "Address is required";
      }
    }

    return next;
  }, [
    addressForm,
    customer?.email,
    showAddressForm,
  ]);
  const suggestions = useMemo(() => {
    if (customer?.email) return [];

    const value = String(addressForm.email || "").trim();

    if (!value || value.includes("@")) return [];

    return [
      `${value}@gmail.com`,
      `${value}@yahoo.com`,
      `${value}@outlook.com`,
    ];
  }, [
    addressForm.email,
    customer?.email,
  ]);
  const touch = (field) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const getError = (field) =>
    touched[field] ? errors[field] || "" : "";

  const changeField = (name, value) => {
    updateAddressField({
      target: {
        name,
        value,
      },
    });
  };

  const selectSavedAddress = (addressId) => {
    setSelectedAddressId(addressId);
    setShowAddressForm(false);
    setTouched({});
  };

  const toggleAddressForm = () => {
    setTouched({});
    setShowAddressForm((current) => !current);
  };

  return (
    <Card className="p-3.5 sm:p-4">
      <button
        type="button"
        onClick={() => setShowAddress((current) => !current)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">
            Step 1
          </p>

          <p className="text-sm font-black uppercase tracking-[0.08em]">
            Email & Delivery Address
          </p>
        </div>

        {showAddress ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {showAddress && (
        <div className="space-y-3 pt-3">
          <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
            {customer?.email ? (
              <>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-black/38">
                  Contact details
                </p>

                <p className="mt-1 text-xs font-black uppercase tracking-[0.06em]">
                  {customer?.name || "OATCLUB Customer"}
                </p>

                <p className="mt-1 break-all text-[10px] font-bold tracking-[0.05em] text-black/45">
                  {customer.email}
                </p>
              </>
            ) : (
              <>
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={addressForm.email}
                  onChange={(event) =>
                    changeField(
                      "email",
                      normalizeEmail(event.target.value),
                    )
                  }
                  onBlur={() => touch("email")}
                  placeholder="Enter email address"
                  inputMode="email"
                  autoComplete="email"
                  error={getError("email")}
                  rightNode={
                    isValidEmail(addressForm.email) ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : null
                  }
                />

                {suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() =>
                          changeField("email", email)
                        }
                        className="border border-neutral-200 bg-white px-3 py-1.5 text-[9px] font-black text-black/55 transition hover:border-black hover:text-black"
                      >
                        {email}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {hasSavedAddresses && (
            <div className="space-y-3">
              {visibleAddresses.map((address) => {
                const selected =
                  String(selectedAddressId) === String(address._id);

                return (
                  <label
                    key={address._id}
                    className={`block cursor-pointer border p-3 transition sm:p-4 ${selected
                        ? "border-black bg-white"
                        : "border-neutral-200 bg-[#fbfaf7] hover:border-black"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        checked={selected}
                        onChange={() =>
                          selectSavedAddress(address._id)
                        }
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.08em]">
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
                          , {address.city}, {address.state} -{" "}
                          {address.postalCode || address.pincode}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {hasSavedAddresses && (
            <button
              type="button"
              onClick={toggleAddressForm}
              className="inline-flex h-10 items-center gap-2 bg-black px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              {showAddressForm ? "Close Address Form" : "Add New Address"}
            </button>
          )}

          {showAddressForm && (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em]">
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="PIN Code"
                  name="postalCode"
                  value={addressForm.postalCode}
                  onChange={updateAddressField}
                  onBlur={() => touch("postalCode")}
                  placeholder="6-digit PIN code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  error={getError("postalCode")}
                  rightNode={
                    String(addressForm.postalCode || "").length === 6 ? (
                      pinLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                      ) : addressForm.city || addressForm.state ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : null
                    ) : null
                  }
                />

                <FormField
                  label="Full Name"
                  name="fullName"
                  value={addressForm.fullName}
                  onChange={updateAddressField}
                  onBlur={() => touch("fullName")}
                  placeholder="Full name"
                  autoComplete="name"
                  error={getError("fullName")}
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={addressForm.phone}
                  onChange={(event) =>
                    changeField("phone", normalizePhone(event.target.value))
                  }
                  onBlur={() => touch("phone")}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  autoComplete="tel"
                  error={getError("phone")}
                />

                <FormField
                  label="City"
                  name="city"
                  value={addressForm.city}
                  onChange={updateAddressField}
                  onBlur={() => touch("city")}
                  placeholder={pinLoading ? "Auto-filling..." : "City"}
                  autoComplete="address-level2"
                  error={getError("city")}
                />

                <FormField
                  label="State"
                  name="state"
                  value={addressForm.state}
                  onChange={updateAddressField}
                  onBlur={() => touch("state")}
                  placeholder={pinLoading ? "Auto-filling..." : "State"}
                  autoComplete="address-level1"
                  error={getError("state")}
                />

                <FormField
                  label="Address Line 1"
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={updateAddressField}
                  onBlur={() => touch("addressLine1")}
                  placeholder="House, building, street"
                  autoComplete="address-line1"
                  error={getError("addressLine1")}
                />

                <FormField
                  label="Address Line 2"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={updateAddressField}
                  placeholder="Area, landmark, optional"
                  autoComplete="address-line2"
                />
              </div>

              <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.06em] text-black/40">
                Your address will be saved automatically when you place
                the order.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}