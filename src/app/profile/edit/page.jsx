// src/app/profile/edit/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Save,
  User2,
  Phone,
  MapPin,
  CalendarDays,
  Sparkles,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// ✅ NEW: use your extracted component
import PayoutDetailsCard from "@/components/profile/PayoutDetailsCard";

const FALLBACK_IMG =
  "https://i.pinimg.com/736x/54/5c/c1/545cc16292db0d62ac333fc422e4aff4.jpg";

function safeDateInputValue(d) {
  try {
    if (!d) return "";
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function safePhotoURL(customer, user) {
  const raw =
    (customer?.profileImage && String(customer.profileImage).trim()) ||
    (user?.photoURL && String(user.photoURL).trim()) ||
    "";
  if (!raw || raw === "null" || raw === "undefined") return FALLBACK_IMG;
  return raw;
}

function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

function clampPhoneUI(v) {
  // keep only digits, max 10 for India UX (adjust anytime)
  return digitsOnly(v).slice(0, 10);
}

function Notice({ notice, onClose }) {
  if (!notice?.text) return null;

  const isErr = notice.type === "error";
  return (
    <div
      className={`mt-5 p-3 border text-sm flex items-start justify-between gap-3 ${
        isErr
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      <div className="flex items-start gap-2">
        {isErr ? (
          <AlertTriangle size={16} className="mt-0.5" />
        ) : (
          <CheckCircle2 size={16} className="mt-0.5" />
        )}
        <div>{notice.text}</div>
      </div>
      <button
        onClick={onClose}
        className="text-xs underline opacity-90 hover:opacity-100"
      >
        Close
      </button>
    </div>
  );
}

export default function ProfileEditPage() {
  const router = useRouter();

  // ✅ stable selectors (helps avoid re-render weirdness)
  const user = useAuthStore((s) => s.user);
  const customer = useAuthStore((s) => s.customer);
  const loading = useAuthStore((s) => s.loading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateCustomerProfile = useAuthStore((s) => s.updateCustomerProfile);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "unknown",
    country: "India",
    state: "",
    city: "",
  });

  // Prevent re-initializing repeatedly
  const didInitRef = useRef(false);

  const profileImg = useMemo(
    () => safePhotoURL(customer, user),
    [customer?.profileImage, user?.photoURL]
  );

  const email = useMemo(
    () => user?.email || customer?.email || "",
    [user?.email, customer?.email]
  );

  // ✅ constant dependency array size
useEffect(() => {
  if (loading) return;

  if (!isAuthenticated || !user) {
    router.push("/auth/login");
    return;
  }

  // ✅ wait for actual Mongo customer before initializing profile form
  if (!customer?._id) return;

  if (!didInitRef.current) {
    didInitRef.current = true;

    setForm({
      name: customer?.name || user?.displayName || user?.name || "",
      phone: customer?.phone || "",
      dateOfBirth: safeDateInputValue(customer?.dateOfBirth),
      gender: customer?.gender || "unknown",
      country: customer?.country || "India",
      state: customer?.state || "",
      city: customer?.city || "",
    });
  }
}, [loading, isAuthenticated, user, customer?._id, router]);

  // ✅ small UX: compute completeness for this edit screen
  const progress = useMemo(() => {
    const checks = [
      { key: "name", ok: String(form.name || "").trim().length > 1 },
      { key: "phone", ok: digitsOnly(form.phone).length >= 10 },
      { key: "city", ok: String(form.city || "").trim().length > 0 },
      { key: "state", ok: String(form.state || "").trim().length > 0 },
      { key: "dob", ok: String(form.dateOfBirth || "").trim().length > 0 },
    ];
    const done = checks.filter((c) => c.ok).length;
    const pct = Math.round((done / checks.length) * 100);
    return { pct, checks };
  }, [form.name, form.phone, form.city, form.state, form.dateOfBirth]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // better phone UX: digits only + max 10
    if (name === "phone") {
      setForm((p) => ({ ...p, phone: clampPhoneUI(value) }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const nameOk = String(form.name || "").trim().length > 1;
    if (!nameOk) return "Please enter your full name.";

    const p = digitsOnly(form.phone);
    if (p && p.length < 10)
      return "Please enter a valid phone number (10 digits).";

    return "";
  };

  const handleSave = async () => {
    setNotice({ type: "", text: "" });

    if (!customer?._id) {
      setNotice({ type: "error", text: "Customer not loaded yet." });
      return;
    }

    const err = validate();
    if (err) {
      setNotice({ type: "error", text: err });
      return;
    }

    setSaving(true);

    const ok = await updateCustomerProfile({
      ...form,
      name: String(form.name || "").trim(),
      phone: String(form.phone || "").trim(),
      country: String(form.country || "").trim(),
      state: String(form.state || "").trim(),
      city: String(form.city || "").trim(),
    });

    setSaving(false);

    if (!ok) {
      setNotice({ type: "error", text: "Update failed. Please try again." });
      return;
    }

    setNotice({ type: "success", text: "Profile updated successfully!" });
    router.push("/profile");
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-white shadow-xl p-6 sm:p-8 border border-gray-200">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full bg-white border border-gray-200 shadow-md active:scale-95 transition"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-800" />
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  Edit Profile <Sparkles size={18} className="text-gray-900" />
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Keep your delivery & support details up to date.
                </p>
              </div>
            </div>

            {/* Compact identity */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border shadow-inner bg-gray-50 rounded-full relative">
                <Image
                  src={profileImg}
                  alt="Profile"
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">
                  {String(form.name || "").trim() || "Your Name"}
                </div>
                <div className="text-gray-500 flex items-center gap-1">
                  <Mail size={14} />
                  {email || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Completion meter (nice UX) */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-gray-900">
                Setup progress
              </div>
              <div className="text-sm text-gray-700">{progress.pct}%</div>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 overflow-hidden">
              <div
                className="h-2 bg-black"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Tip: Adding phone + city/state makes deliveries & support faster.
            </div>
          </div>

          <Notice
            notice={notice}
            onClose={() => setNotice({ type: "", text: "" })}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg border border-gray-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="space-y-5">
              <Field
                icon={<User2 size={16} className="text-gray-700" />}
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <Field
                icon={<Phone size={16} className="text-gray-700" />}
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                hint="We’ll use this for delivery updates."
              />

              <Field
                icon={<CalendarDays size={16} className="text-gray-700" />}
                type="date"
                label="Date of Birth"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />

              <ReadOnlyField label="Email" value={email || "—"} />
            </div>

            {/* Right */}
            <div className="space-y-5">
              <SelectField
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "non_binary", label: "Non-Binary" },
                  { value: "prefer_not_to_say", label: "Prefer Not To Say" },
                  { value: "unknown", label: "Other" },
                ]}
              />

              <Field
                icon={<MapPin size={16} className="text-gray-700" />}
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                />
                <Field
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="text-xs text-gray-500">
                Accurate details help us deliver faster and resolve support
                tickets quicker.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3 flex-wrap">
            <button
              onClick={() => router.push("/profile")}
              className="px-5 py-3 text-sm border border-gray-300 bg-white shadow-sm hover:shadow-md transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-3 text-sm bg-black text-white shadow-md hover:bg-gray-900 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ✅ Payout details component */}
        <PayoutDetailsCard />
      </div>
    </section>
  );
}

/* ------------------------------ */
/* Components */
/* ------------------------------ */

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon = null,
  inputMode,
  hint,
}) {
  return (
    <div className="space-y-2">
      <label className="text-gray-700 text-sm">{label}</label>
      <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 shadow-sm px-3 py-2.5">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>
      {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-gray-700 text-sm">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 bg-gray-50 shadow-sm px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="space-y-2">
      <label className="text-gray-700 text-sm">{label}</label>
      <div className="w-full border border-gray-200 bg-white shadow-sm px-3 py-3 text-sm text-gray-700 flex items-center gap-2">
        <Mail size={14} className="text-gray-500" />
        {value}
      </div>
    </div>
  );
}