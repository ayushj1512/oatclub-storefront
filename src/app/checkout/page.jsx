"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, initialize } = useCartStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const subtotal = totalPrice();

  const [showOrder, setShowOrder] = useState(true);
  const [showAddress, setShowAddress] = useState(true);

  const [address, setAddress] = useState({
    first_name: "",
    last_name: "",
    country: "India",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayment = () => {
    alert("Payment gateway integration coming soon!");
  };

  return (
    <section className="w-full min-h-screen bg-[#fafafa] py-10 px-4 flex justify-center">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-[#ddd]">

        {/* HEADER */}
        <h2 className="text-4xl font-semibold bg-[#800020] text-white py-4 rounded-xl mb-10 text-center tracking-tight">
          Checkout
        </h2>

        {/* ORDER SUMMARY */}
        <div className="border border-[#ccc] rounded-2xl overflow-hidden mb-8 shadow-sm">
          <button
            className="w-full flex justify-between items-center p-5 bg-[#800020] text-lg font-medium text-white"
            onClick={() => setShowOrder(!showOrder)}
          >
            <span>Order Summary</span>
            {showOrder ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {showOrder && (
            <div className="p-6 border-t border-[#ccc] animate-fadeSlide">
              {items?.length === 0 ? (
                <p className="text-gray-600 text-center py-6">
                  Your cart is empty.
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-[#e5e5e5] pb-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-[75px] h-[85px] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                          <Image
                            src={item.image || item.images?.[0]?.src}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-black text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.qty}</p>
                        </div>
                      </div>

                      <p className="text-[#800020] font-semibold text-sm">
                        ₹{item.price * item.qty}
                      </p>
                    </div>
                  ))}

                  <div className="mt-2 pt-4">
                    <div className="flex justify-between text-black mb-2 text-sm">
                      <p>Subtotal</p>
                      <p>₹{subtotal}</p>
                    </div>

                    <div className="flex justify-between text-black mb-3 text-sm">
                      <p>Shipping</p>
                      <p className="text-green-700 font-medium">Free</p>
                    </div>

                    <div className="flex justify-between text-xl font-semibold text-[#800020] mt-3">
                      <p>Total</p>
                      <p>₹{subtotal}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BILLING DETAILS */}
        <div className="border border-[#ccc] rounded-2xl overflow-hidden shadow-sm mb-10">
          <button
            className="w-full flex justify-between items-center p-5 bg-[#800020] text-lg font-medium text-white"
            onClick={() => setShowAddress(!showAddress)}
          >
            <span>Billing Details</span>
            {showAddress ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {showAddress && (
            <div className="p-6 border-t border-[#ccc] animate-fadeSlide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <FormField label="First name *" name="first_name" value={address.first_name} onChange={handleChange} />
                <FormField label="Last name *" name="last_name" value={address.last_name} onChange={handleChange} />

                <FormField label="Country *" name="country" readOnly value={address.country} onChange={handleChange} />
                <FormField label="Town / City *" name="city" value={address.city} onChange={handleChange} />

                <FormField label="State *" name="state" value={address.state} onChange={handleChange} />
                <FormField label="PIN Code *" name="pincode" value={address.pincode} onChange={handleChange} />

                <FormField label="Phone *" name="phone" value={address.phone} onChange={handleChange} />
                <FormField label="Email *" name="email" value={address.email} onChange={handleChange} />
              </div>

              <FormField
                label="Street address *"
                name="street"
                value={address.street}
                onChange={handleChange}
                className="mt-5"
              />

              <FormField
                label="Apartment (optional)"
                name="apartment"
                value={address.apartment}
                onChange={handleChange}
                className="mt-5"
              />
            </div>
          )}
        </div>

        {/* PAYMENT BUTTON */}
        <div className="text-center">
          <button
            onClick={handlePayment}
            className="bg-[#800020] hover:bg-[#5a0016] transition-all text-white px-12 py-4 rounded-full text-lg font-medium tracking-wide shadow-lg hover:shadow-xl"
          >
            Pay & Place Order
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------
      REUSABLE FORM FIELD
---------------------------------- */
function FormField({ label, name, value, onChange, readOnly, className }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="font-medium text-black text-sm mb-1">{label}</label>
      <input
        name={name}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        className="border border-[#bbb] bg-white rounded-xl px-4 py-3 text-sm shadow-sm
        focus:ring-2 focus:ring-[#800020]/40 focus:border-[#800020] outline-none transition-all"
      />
    </div>
  );
}
