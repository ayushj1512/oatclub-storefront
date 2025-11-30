"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  CreditCard,
  Smartphone,
  Landmark,
  IndianRupee,
} from "lucide-react";

const BRAND = "#800020";

export default function CheckoutPage() {
  const { items, totalPrice, initialize } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, fetchAddresses, createAddress } = useAddressStore();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState("upi");

  const [showOrder, setShowOrder] = useState(true);
  const [showAddressSection, setShowAddressSection] = useState(true);
  const [showPaymentSection, setShowPaymentSection] = useState(true);

  const subtotal = totalPrice();

  // NEW ADDRESS FORM
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    firebaseUID: "",
    email: "",
    addressType: "home",
  });

  /* ------------------------------
     Load Cart + Addresses
  ------------------------------ */
  useEffect(() => {
    initialize();

    if (user) {
      fetchAddresses(user.uid);

      setAddressForm((prev) => ({
        ...prev,
        fullName: user.name,
        firebaseUID: user.uid,
        email: user.email,
      }));
    }
  }, [user]);

  const updateAddressField = (e) =>
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });

  const saveNewAddress = async () => {
    setSavingAddress(true);
    await createAddress(addressForm);
    setSavingAddress(false);
    setShowAddressForm(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return alert("Please select an address.");
    alert("Payment processing UI coming soon 🚀");
  };

  /* ------------------------------------------------------------------
      MAIN UI
  ------------------------------------------------------------------ */
  return (
    <section className="w-full min-h-screen bg-[#f5f5f5] py-10 px-4 flex justify-center">
      <div className="w-full max-w-6xl">

        {/* PAGE HEADER */}
        <h1 className="text-3xl font-bold text-center tracking-tight mb-10">
          Checkout
        </h1>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT SIDE — ADDRESS + PAYMENT */}
          <div className="space-y-10">

            {/* DELIVERY ADDRESS SECTION */}
            <div className="bg-white border border-gray-200 shadow-sm p-6">
              <button
                onClick={() => setShowAddressSection(!showAddressSection)}
                className="w-full flex justify-between items-center pb-4 border-b"
              >
                <span className="text-lg font-semibold">Delivery Address</span>
                {showAddressSection ? <ChevronUp /> : <ChevronDown />}
              </button>

              {showAddressSection && (
                <div className="pt-4 space-y-5">

                  {/* SAVED ADDRESSES */}
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`block p-4 border ${
                          selectedAddress === addr._id
                            ? "border-black"
                            : "border-gray-300"
                        } hover:border-black transition cursor-pointer`}
                        onClick={() => setSelectedAddress(addr._id)}
                      >
                        <div className="flex justify-between">
                          <div className="pr-4">
                            <p className="font-semibold text-black">{addr.fullName}</p>
                            <p className="text-xs text-gray-700">{addr.phone}</p>
                            <p className="text-sm text-gray-700 mt-1 leading-5">
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`},{" "}
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                          </div>

                          <input
                            type="radio"
                            readOnly
                            checked={selectedAddress === addr._id}
                            className="w-5 h-5 accent-black"
                          />
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No saved addresses.</p>
                  )}

                  {/* ADD ADDRESS BUTTON */}
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 text-sm"
                  >
                    <Plus size={16} /> Add New Address
                  </button>

                  {/* ADD ADDRESS FORM */}
                  {showAddressForm && (
                    <div className="bg-gray-100 p-5 border border-gray-300">
                      <h3 className="font-semibold mb-3">New Address</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" name="fullName" value={addressForm.fullName} onChange={updateAddressField} />
                        <FormField label="Phone" name="phone" value={addressForm.phone} onChange={updateAddressField} />
                        <FormField label="Address Line 1" name="addressLine1" value={addressForm.addressLine1} onChange={updateAddressField} />
                        <FormField label="Address Line 2" name="addressLine2" value={addressForm.addressLine2} onChange={updateAddressField} />
                        <FormField label="City" name="city" value={addressForm.city} onChange={updateAddressField} />
                        <FormField label="State" name="state" value={addressForm.state} onChange={updateAddressField} />
                        <FormField label="PIN Code" name="postalCode" value={addressForm.postalCode} onChange={updateAddressField} />
                      </div>

                      <button
                        onClick={saveNewAddress}
                        disabled={savingAddress}
                        className="mt-4 w-full bg-[var(--brand,#800020)] text-white py-3 text-sm"
                      >
                        {savingAddress ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PAYMENT SECTION */}
            <div className="bg-white border border-gray-200 shadow-sm p-6">
              <button
                onClick={() => setShowPaymentSection(!showPaymentSection)}
                className="w-full flex justify-between items-center pb-4 border-b"
              >
                <span className="text-lg font-semibold">Payment Method</span>
                {showPaymentSection ? <ChevronUp /> : <ChevronDown />}
              </button>

              {showPaymentSection && (
                <div className="pt-4 space-y-4">

                  {/* UPI */}
                  <PaymentOption
                    label="UPI Apps"
                    value="upi"
                    icon={<Smartphone />}
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                  />

                  {/* CARD */}
                  <PaymentOption
                    label="Credit / Debit Card"
                    value="card"
                    icon={<CreditCard />}
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                  />

                  {/* NET BANKING */}
                  <PaymentOption
                    label="Net Banking"
                    value="netbanking"
                    icon={<Landmark />}
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                  />

                  {/* COD */}
                  <PaymentOption
                    label="Cash on Delivery"
                    value="cod"
                    icon={<IndianRupee />}
                    selected={selectedPayment}
                    setSelected={setSelectedPayment}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — ORDER SUMMARY */}
          <div className="bg-white border border-gray-200 shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold pb-4 border-b">Order Summary</h2>

            <div className="pt-4 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="relative w-[65px] h-[75px] bg-gray-100">
                      <Image
                        src={item.image || item.images?.[0]?.src}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-black text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-[var(--brand,#800020)]">
                    ₹{item.price * item.qty}
                  </p>
                </div>
              ))}

              {/* TOTAL */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-sm mb-1">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between mt-3 text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-6 w-full bg-[var(--brand,#800020)] hover:bg-[#5a0016] text-white py-3 text-lg"
            >
              Pay & Place Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------
    REUSABLE PAYMENT OPTION
---------------------------------- */
function PaymentOption({ label, value, icon, selected, setSelected }) {
  return (
    <label
      className={`flex items-center justify-between p-4 border cursor-pointer transition ${
        selected === value ? "border-black" : "border-gray-300"
      }`}
      onClick={() => setSelected(value)}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <input
        type="radio"
        readOnly
        checked={selected === value}
        className="w-5 h-5 accent-black"
      />
    </label>
  );
}

/* ---------------------------------
      REUSABLE FORM FIELD
---------------------------------- */
function FormField({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
      />
    </div>
  );
}
