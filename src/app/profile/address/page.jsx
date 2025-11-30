"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import { useEffect, useState } from "react";
import { Plus, MapPin, ChevronLeft } from "lucide-react";

const BRAND = "#800020";

export default function AddressBookPage() {
  const router = useRouter();
  const { user, customer } = useAuthStore();
  const { addresses, fetchAddresses, createAddress } = useAddressStore();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    addressType: "home",
    firebaseUID: "",
    email: "",
    customerId: "",
    isDefaultShipping: false,
  });

  // Load user + addresses
  useEffect(() => {
    if (user) {
      fetchAddresses(user.uid);

      setFormData((prev) => ({
        ...prev,
        fullName: customer?.name || user.name,
        phone: customer?.phone || "",
        firebaseUID: user.uid,
        email: user.email,
        customerId: customer?._id,
      }));
    }
  }, [user, customer]);

  const updateField = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveAddress = async () => {
    setSaving(true);
    await createAddress(formData);
    setSaving(false);
    setShowForm(false);
  };

  return (
    <section className="min-h-screen w-full bg-gray-50 flex flex-col py-10 px-4">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => router.push("/profile")}
          className="text-gray-700 hover:text-black transition"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
      </div>

      {/* FLEX LAYOUT: LEFT = LIST, RIGHT = ADD FORM */}
      <div className="flex flex-col lg:flex-row gap-10 w-full">

        {/* LEFT SIDE — SAVED ADDRESSES */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MapPin size={22} color={BRAND} /> Saved Addresses
          </h2>

          {addresses.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <p className="font-semibold text-gray-900">{addr.fullName}</p>
                  <p className="text-sm text-gray-700">{addr.phone}</p>

                  <p className="text-sm text-gray-700 mt-2 leading-5">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""},<br />
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <span className="text-[11px] bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {addr.addressType.toUpperCase()}
                    </span>

                    {addr.isDefaultShipping && (
                      <span className="text-[11px] bg-green-200 text-green-700 px-2 py-1 rounded-full">
                        Default Shipping
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm mb-6">No saved addresses yet.</p>
          )}

          {/* SMALL ADD NEW BUTTON FOR MOBILE */}
          <button
            onClick={() => setShowForm(true)}
            className="lg:hidden mt-6 bg-black text-white w-full py-3 rounded-xl text-sm hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add New Address
          </button>
        </div>

        {/* RIGHT SIDE — ADD ADDRESS FORM */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl border border-gray-200 p-6 h-fit">
          <h3 className="text-xl font-bold mb-4">Add New Address</h3>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={updateField}
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={updateField}
            />

            <Input
              label="Alternate Phone"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={updateField}
            />

            <Select
              label="Address Type"
              name="addressType"
              value={formData.addressType}
              onChange={updateField}
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="other">Other</option>
            </Select>

            <Input
              label="Address Line 1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={updateField}
            />
            <Input
              label="Address Line 2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={updateField}
            />

            <Input
              label="Landmark"
              name="landmark"
              value={formData.landmark}
              onChange={updateField}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={updateField}
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={updateField}
              />
            </div>

            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={updateField}
            />
          </div>

          <button
            onClick={saveAddress}
            disabled={saving}
            className="mt-6 bg-[var(--brand,#800020)] w-full py-3 rounded-xl text-white text-sm hover:bg-[#6a001a] transition shadow-md"
            style={{ backgroundColor: BRAND }}
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* SMALL INPUT COMPONENTS */
const Input = ({ label, ...props }) => (
  <div className="flex flex-col w-full">
    <label className="text-xs text-gray-500 mb-1">{label}</label>
    <input
      {...props}
      className="p-3 rounded-lg border border-gray-300 bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col w-full">
    <label className="text-xs text-gray-500 mb-1">{label}</label>
    <select
      {...props}
      className="p-3 rounded-lg border border-gray-300 bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
    >
      {children}
    </select>
  </div>
);
