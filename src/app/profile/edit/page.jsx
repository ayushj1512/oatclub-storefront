"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Save } from "lucide-react";

const FALLBACK_IMG =
  "https://i.pinimg.com/736x/54/5c/c1/545cc16292db0d62ac333fc422e4aff4.jpg";

export default function ProfileEditPage() {
  const router = useRouter();

  const {
    user,
    customer,
    loading,
    isAuthenticated,
    updateCustomerProfile, // ⭐ NEW (syncs backend + Zustand)
  } = useAuthStore();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "unknown",
    country: "India",
    state: "",
    city: "",
  });

  /* -----------------------------------------------------------
     INITIAL LOAD — Fill Form After Customer Loads
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push("/auth/login");
        return;
      }

      if (customer) {
        setForm({
          name: customer.name || user.displayName || "",
          phone: customer.phone || "",
          dateOfBirth: customer.dateOfBirth
            ? customer.dateOfBirth.split("T")[0]
            : "",
          gender: customer.gender || "unknown",
          country: customer.country || "India",
          state: customer.state || "",
          city: customer.city || "",
        });
      }
    }
  }, [loading, user, customer]);

  /* -----------------------------------------------------------
     FORM CHANGE HANDLER
  ------------------------------------------------------------ */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* -----------------------------------------------------------
     SAVE — Using updateCustomerProfile() (Zustand + Backend Sync)
  ------------------------------------------------------------ */
  const handleSave = async () => {
    if (!customer?._id) return alert("Customer not loaded yet.");

    setSaving(true);

    const updated = await updateCustomerProfile(form); // ⭐ DIRECT CALL

    setSaving(false);

    if (!updated) return alert("Update failed.");

    alert("Profile updated successfully!");
    router.push("/profile");
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 text-lg">
        Loading...
      </div>
    );

  const profileImg =
    customer?.profileImage || user?.photoURL || FALLBACK_IMG;

  /* -----------------------------------------------------------
     UI — Extra Clean iOS + Modern Web Hybrid
  ------------------------------------------------------------ */
  return (
    <section className="min-h-screen w-full bg-[#F2F3F7] px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white shadow-md active:scale-95 transition"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Edit Profile
        </h1>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border border-gray-200 relative">
          <Image
            src={profileImg}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Form Card */}
      <div
        className="
          bg-white rounded-3xl shadow-xl p-8 
          grid grid-cols-1 md:grid-cols-2 gap-6
        "
      >
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <IOSField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <IOSField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <IOSField
            type="date"
            label="Date of Birth"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-700 text-sm">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="
                w-full bg-[#F4F4F7] py-3 px-4 rounded-2xl text-sm 
                shadow-inner focus:ring-2 focus:ring-black outline-none
              "
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-Binary</option>
              <option value="prefer_not_to_say">Prefer Not To Say</option>
              <option value="unknown">Other</option>
            </select>
          </div>

          <IOSField
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
          />

          <IOSField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />

          <IOSField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="
            w-full bg-black text-white py-4 rounded-2xl 
            text-lg font-medium shadow-xl active:scale-95 
            transition flex items-center justify-center gap-2
          "
        >
          <Save size={20} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </section>
  );
}

/* -----------------------------------------------------------
   iOS Styled Input Component
------------------------------------------------------------ */
function IOSField({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-gray-700 text-sm">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full bg-[#F4F4F7] py-3 px-4 rounded-2xl text-sm shadow-inner 
          focus:ring-2 focus:ring-black outline-none transition
        "
      />
    </div>
  );
}
