"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";

const normalizeEmail = (value = "") =>
  String(value || "").trim().toLowerCase();

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const normalizePhone = (value = "") => {
  let digits = String(value || "").replace(/\D/g, "");

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
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-black/40">
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
          className={`h-11 w-full border bg-[#fffefa] px-3 pr-11 text-[13px] font-bold tracking-[0.04em] text-black outline-none transition placeholder:uppercase placeholder:text-black/25 ${error
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
  addressesLoading = false,

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

  const firebaseUID =
    user?.uid ||
    user?.firebaseUID ||
    customer?.firebaseUID ||
    "";

  const customerId =
    customer?._id ||
    customer?.id ||
    "";

  const isLoggedIn = Boolean(firebaseUID || customerId);

  const visibleAddresses = useMemo(() => {
    if (!isLoggedIn || !Array.isArray(addresses)) {
      return [];
    }

    return addresses.filter((address) => address?._id);
  }, [addresses, isLoggedIn]);

  const hasSavedAddresses = visibleAddresses.length > 0;

  const selectedAddress = useMemo(
    () =>
      visibleAddresses.find(
        (address) =>
          String(address._id) === String(selectedAddressId),
      ) || null,
    [visibleAddresses, selectedAddressId],
  );

  useEffect(() => {
    if (addressesLoading) return;

    if (!hasSavedAddresses) {
      setSelectedAddressId(null);
      setShowAddressForm(true);
      return;
    }

    // ✅ User ne manually "Use a new address" select kiya hai
    // Is case mein saved address auto-select mat karo
    if (showAddressForm) {
      return;
    }

    const selectedExists = visibleAddresses.some(
      (address) =>
        String(address._id) === String(selectedAddressId)
    );

    if (!selectedExists) {
      const defaultAddress =
        visibleAddresses.find(
          (address) => address.isDefaultShipping
        ) ||
        visibleAddresses.find(
          (address) => address.isDefaultBilling
        ) ||
        visibleAddresses[0];

      setSelectedAddressId(defaultAddress._id);
      setShowAddressForm(false);
    }
  }, [
    addressesLoading,
    hasSavedAddresses,
    selectedAddressId,
    showAddressForm,
    visibleAddresses,
    setSelectedAddressId,
    setShowAddressForm,
  ]);

  const errors = useMemo(() => {
    const next = {};

    const customerEmail =
      customer?.email ||
      user?.email ||
      "";

    if (!customerEmail && !isValidEmail(addressForm.email)) {
      next.email = "Enter a valid email";
    }

    if (showAddressForm) {
      if (!addressForm.fullName?.trim()) {
        next.fullName = "Full name is required";
      }

      if (!isValidPhone(addressForm.phone)) {
        next.phone = "Enter a valid 10-digit phone";
      }

      if (
        !/^[0-9]{6}$/.test(
          String(addressForm.postalCode || ""),
        )
      ) {
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
    user?.email,
    showAddressForm,
  ]);

  const suggestions = useMemo(() => {
    if (customer?.email || user?.email) return [];

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
    user?.email,
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

  const chooseNewAddress = () => {
    setSelectedAddressId(null);
    setShowAddressForm(true);
    setTouched({});
  };

  const closeNewAddressForm = () => {
    setShowAddressForm(false);
    setTouched({});

    if (!selectedAddressId && visibleAddresses.length) {
      const fallback =
        visibleAddresses.find(
          (address) => address.isDefaultShipping,
        ) || visibleAddresses[0];

      setSelectedAddressId(fallback._id);
    }
  };

  const customerEmail =
    customer?.email ||
    user?.email ||
    "";

  const customerName =
    customer?.name ||
    user?.displayName ||
    "OATCLUB Customer";

  return (
    <Card className="p-3.5 sm:p-4">
      <button
        type="button"
        onClick={() =>
          setShowAddress((current) => !current)
        }
        className="flex w-full items-center justify-between"
      >
        <div className="text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/35">
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
            {customerEmail ? (
              <>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-black/40">
                  Contact details
                </p>

                <p className="mt-1 text-xs font-black uppercase tracking-[0.06em]">
                  {customerName}
                </p>

                <p className="mt-1 break-all text-[10px] font-bold tracking-[0.05em] text-black/45">
                  {customerEmail}
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

          {addressesLoading && isLoggedIn && (
            <div className="flex items-center justify-center gap-2 border border-neutral-200 bg-[#fbfaf7] px-3 py-6">
              <Loader2 className="h-4 w-4 animate-spin" />

              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/45">
                Loading saved addresses
              </p>
            </div>
          )}

          {!addressesLoading && hasSavedAddresses && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/40">
                  Saved addresses
                </p>

                <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-black/35">
                  {visibleAddresses.length} saved
                </span>
              </div>

              {visibleAddresses.map((address) => {
                const selected =
                  !showAddressForm &&
                  String(selectedAddressId) ===
                  String(address._id);

                return (
                  <label
                    key={address._id}
                    className={`block cursor-pointer border p-3 transition sm:p-4 ${selected
                        ? "border-black bg-white shadow-sm"
                        : "border-neutral-200 bg-[#fbfaf7] hover:border-black"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        value={address._id}
                        checked={selected}
                        onChange={() =>
                          selectSavedAddress(address._id)
                        }
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-[0.08em]">
                            {address.fullName}
                          </p>

                          {address.isDefaultShipping && (
                            <span className="bg-black px-2 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-white">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">
                          {address.phone}
                        </p>

                        <p className="mt-2 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/55">
                          {address.addressLine1}
                          {address.addressLine2
                            ? `, ${address.addressLine2}`
                            : ""}
                          , {address.city}, {address.state} -{" "}
                          {address.postalCode ||
                            address.pincode}
                        </p>
                      </div>

                      {selected && (
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                      )}
                    </div>
                  </label>
                );
              })}

              <label
                onClick={chooseNewAddress}
                className={`block cursor-pointer border p-3 transition sm:p-4 ${showAddressForm
                    ? "border-black bg-white shadow-sm"
                    : "border-neutral-200 bg-[#fbfaf7] hover:border-black"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryAddress"
                    checked={showAddressForm}
                    onChange={chooseNewAddress}
                    className="h-4 w-4 accent-black"
                  />

                  <div className="flex flex-1 items-center gap-2">
                    <Plus className="h-4 w-4" />

                    <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                      Use a new address
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}

          {!addressesLoading &&
            isLoggedIn &&
            !hasSavedAddresses && (
              <div className="border border-neutral-200 bg-[#fbfaf7] p-4 text-center">
                <MapPin className="mx-auto h-5 w-5 text-black/45" />

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]">
                  No saved address found
                </p>

                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-black/40">
                  Add your delivery address below
                </p>
              </div>
            )}

          {showAddressForm && (
            <div className="border border-neutral-200 bg-[#fbfaf7] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xs font-black uppercase tracking-[0.14em]">
                  New Delivery Address
                </h3>

                {hasSavedAddresses && (
                  <button
                    type="button"
                    onClick={closeNewAddressForm}
                    className="text-[9px] font-black uppercase tracking-[0.12em] text-black/45 hover:text-black"
                  >
                    Use saved address
                  </button>
                )}
              </div>

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
                    String(
                      addressForm.postalCode || "",
                    ).length === 6 ? (
                      pinLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                      ) : addressForm.city ||
                        addressForm.state ? (
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
                    changeField(
                      "phone",
                      normalizePhone(event.target.value),
                    )
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
                  placeholder={
                    pinLoading ? "Auto-filling..." : "City"
                  }
                  autoComplete="address-level2"
                  error={getError("city")}
                />

                <FormField
                  label="State"
                  name="state"
                  value={addressForm.state}
                  onChange={updateAddressField}
                  onBlur={() => touch("state")}
                  placeholder={
                    pinLoading ? "Auto-filling..." : "State"
                  }
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
                This address will be used for the current order
                and saved after successful order placement.
              </p>
            </div>
          )}

          {!showAddressForm && selectedAddress && (
            <p className="text-[9px] font-bold uppercase tracking-[0.07em] text-black/40">
              Selected address will be used for delivery.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}