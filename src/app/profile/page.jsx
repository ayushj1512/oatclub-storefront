// src/app/profile/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { useRouter } from "next/navigation";
import {
  Edit3,
  LogOut,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Plus,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import RecentlyViewedRow from "@/components/profile/RecentlyViewedRow";
import SupportTicketsRow from "@/components/profile/SupportTicketsRow";

const FALLBACK_IMG =
  "https://i.pinimg.com/736x/54/5c/c1/545cc16292db0d62ac333fc422e4aff4.jpg";

const QUOTES = [
  "Fashion is the armor to survive the everyday.",
  "Style is who you are without speaking.",
  "Elegance begins the moment you decide to be yourself.",
  "Your vibe attracts your style.",
  "Wear something that makes you smile today.",
  "You are your best accessory.",
  "Confidence is your best outfit — wear it daily.",
  "Soft, simple, effortlessly beautiful.",
];

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return { label: "Delivered", cls: "text-green-600" };
  if (s === "shipped" || s === "out_for_delivery")
    return {
      label: s === "out_for_delivery" ? "Out for delivery" : "Shipped",
      cls: "text-blue-600",
    };
  if (s === "packed" || s === "processing")
    return {
      label: s === "packed" ? "Packed" : "Processing",
      cls: "text-yellow-600",
    };
  if (s === "returned") return { label: "Returned", cls: "text-purple-600" };
  if (s === "cancelled") return { label: "Cancelled", cls: "text-red-600" };
  return { label: status || "Pending", cls: "text-gray-700" };
}

function buildSafePhotoURL(customer, user) {
  const raw =
    (customer?.profileImage && String(customer.profileImage).trim()) ||
    (user?.photoURL && String(user.photoURL).trim()) ||
    "";

  if (!raw || raw.length < 6) return FALLBACK_IMG;
  if (raw === "null" || raw === "undefined") return FALLBACK_IMG;
  return raw;
}

/* ------------------------------ */
/* Profile completeness helpers   */
/* ------------------------------ */
function isFilled(v) {
  if (v == null) return false;
  const s = String(v).trim();
  return s.length > 0 && s !== "null" && s !== "undefined";
}

function calcProfileCompleteness({ user, customer, addresses }) {
  const items = [
    {
      key: "name",
      label: "Name",
      weight: 20,
      ok: isFilled(user?.name || user?.displayName || customer?.name),
      action: { label: "Edit profile", href: "/profile/edit" },
    },
    {
      key: "email",
      label: "Email",
      weight: 15,
      ok: isFilled(user?.email || customer?.email),
      action: { label: "Edit profile", href: "/profile/edit" },
    },
    {
      key: "phone",
      label: "Phone",
      weight: 15,
      ok: isFilled(customer?.phone),
      action: { label: "Add phone", href: "/profile/edit" },
    },
    {
      key: "dob",
      label: "DOB",
      weight: 10,
      ok: isFilled(customer?.dateOfBirth),
      action: { label: "Add DOB", href: "/profile/edit" },
    },
    {
      key: "gender",
      label: "Gender",
      weight: 5,
      ok: isFilled(customer?.gender) && customer?.gender !== "unknown",
      action: { label: "Set gender", href: "/profile/edit" },
    },
    {
      key: "city",
      label: "City",
      weight: 10,
      ok: isFilled(customer?.city),
      action: { label: "Add city", href: "/profile/edit" },
    },
    {
      key: "state",
      label: "State",
      weight: 10,
      ok: isFilled(customer?.state),
      action: { label: "Add state", href: "/profile/edit" },
    },
    {
      key: "country",
      label: "Country",
      weight: 5,
      ok: isFilled(customer?.country),
      action: { label: "Add country", href: "/profile/edit" },
    },
    {
      key: "address",
      label: "Saved Address",
      weight: 10,
      ok: Array.isArray(addresses) && addresses.length > 0,
      action: { label: "Add address", href: "/profile/address" },
    },
  ];

  const total = items.reduce((s, i) => s + i.weight, 0);
  const score = items.reduce((s, i) => s + (i.ok ? i.weight : 0), 0);
  const pct = total ? Math.round((score / total) * 100) : 0;

  const missing = items.filter((i) => !i.ok);
  return { pct, items, missing };
}

function progressTone(pct) {
  // Burgundy palette (Tailwind default: burgundy-ish = rose/red/wine)
  // If you have a custom brand color like `bg-burgundy-600`, replace below easily.
  if (pct >= 90) {
    return {
      bar: "bg-black",
      ring: "text-black",
      badge: "bg-white text-black border-black/20",
      msg: "All set!",
      banner: "from-white to-white",
      border: "border-black/10",
    };
  }

  // ✅ Replace blue with burgundy
  if (pct >= 60) {
    return {
      bar: "bg-rose-800", // burgundy tone
      ring: "text-rose-800",
      badge: "bg-rose-50 text-rose-900 border-rose-200",
      msg: "Almost there",
      banner: "from-rose-50 to-white",
      border: "border-rose-200",
    };
  }

  if (pct >= 30) {
    return {
      bar: "bg-rose-700",
      ring: "text-rose-700",
      badge: "bg-rose-50 text-rose-900 border-rose-200",
      msg: "Let’s complete it",
      banner: "from-rose-50 to-white",
      border: "border-rose-200",
    };
  }

  return {
    bar: "bg-red-700", // deeper red for low completion
    ring: "text-red-700",
    badge: "bg-red-50 text-red-800 border-red-200",
    msg: "Add a few details",
    banner: "from-red-50 to-white",
    border: "border-red-200",
  };
}


function BannerProgress({ completeness, tone, primaryAction, onClose, onCta }) {
  // if complete, you can still show it; but usually hide automatically
  const showMissing = completeness?.missing?.length > 0;

  return (
    <div
      className={`bg-gradient-to-r ${tone.banner} shadow-lg border ${tone.border} p-5 sm:p-6 relative`}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 p-2 hover:bg-black/5 transition"
        aria-label="Close"
        title="Close"
      >
        <X size={18} className="text-gray-700" />
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap pr-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white border border-gray-200 shadow-sm">
              <ShieldCheck size={18} className="text-gray-900" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Complete your profile</h3>
            <span className={`text-xs px-3 py-1.5 border ${tone.badge}`}>{tone.msg}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Faster checkout, smoother deliveries, and quick support—just a few details away.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-semibold text-gray-900 leading-none">
              {completeness.pct}%
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-end gap-1 mt-1">
              <Sparkles size={14} className={tone.ring} />
              Profile progress
            </div>
          </div>

          <button
            onClick={onCta}
            className="bg-black text-white px-4 py-2 text-sm shadow-md hover:bg-gray-900 transition"
          >
            {primaryAction.label}
          </button>
        </div>
      </div>

      {/* Progress bar (color changes with pct via tone.bar) */}
      <div className="mt-4">
        <div className="w-full h-2 bg-white/70 border border-gray-200 overflow-hidden">
          <div className={`h-2 ${tone.bar}`} style={{ width: `${completeness.pct}%` }} />
        </div>
      </div>

      {/* Missing chips */}
      {showMissing ? (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-900">Missing</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {completeness.missing.slice(0, 7).map((m) => (
              <Link
                key={m.key}
                href={m.action?.href || "/profile/edit"}
                className="text-xs bg-white border border-gray-200 px-2 py-1 hover:shadow-sm transition"
                title="Tap to update"
              >
                {m.label}
              </Link>
            ))}
            {completeness.missing.length > 7 ? (
              <span className="text-xs text-gray-600">
                +{completeness.missing.length - 7} more
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-700">✅ Your profile looks complete.</div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const { user, customer, isAuthenticated, loading, requestLogout } = useAuthStore();
  const { addresses, fetchAddresses } = useAddressStore();
  const { orders, fetchMyOrders, loading: ordersLoading, error: ordersError } = useOrderStore();

  const [quote, setQuote] = useState("");
  const [photoSrc, setPhotoSrc] = useState(FALLBACK_IMG);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Banner dismiss state (persist per browser)
  const [hideBanner, setHideBanner] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  useEffect(() => {
    try {
      const v = localStorage.getItem("miray_profile_progress_banner");
      if (v === "hidden") setHideBanner(true);
    } catch {}
  }, []);

  const closeBanner = () => {
    setHideBanner(true);
    try {
      localStorage.setItem("miray_profile_progress_banner", "hidden");
    } catch {}
  };

  // Redirect if not logged in + load profile basics
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user?.uid) {
      router.push("/auth/login");
      return;
    }

    setFormData({
      name: user?.name || user?.displayName || "",
      email: user?.email || "",
      phone: customer?.phone || "",
    });

    setPhotoSrc(buildSafePhotoURL(customer, user));
    fetchAddresses(user.uid);
  }, [loading, isAuthenticated, user?.uid, customer?._id, fetchAddresses, router]);

  // Update photo if customer/user changes
  useEffect(() => {
    if (!isAuthenticated) return;
    setPhotoSrc(buildSafePhotoURL(customer, user));
  }, [isAuthenticated, customer?.profileImage, user?.photoURL]);

  // Orders polling
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    if (!customer?._id) return;

    fetchMyOrders(customer._id);
    const interval = setInterval(() => fetchMyOrders(customer._id), 15000);
    return () => clearInterval(interval);
  }, [loading, isAuthenticated, customer?._id, fetchMyOrders]);

  const handleLogout = () => requestLogout();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 text-lg">
        Loading profile...
      </div>
    );
  }

  if (!user) return null;

  const safeName =
    formData.name?.length > 1
      ? formData.name.charAt(0).toUpperCase() + formData.name.slice(1)
      : "User";

  const recentOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.slice(0, 2);
  }, [orders]);

  const completeness = useMemo(() => {
    return calcProfileCompleteness({ user, customer, addresses });
  }, [user, customer, addresses]);

  const tone = useMemo(() => progressTone(completeness.pct), [completeness.pct]);

  const primaryAction = useMemo(() => {
    const first = completeness.missing?.[0];
    return first?.action || { label: "Update profile", href: "/profile/edit" };
  }, [completeness.missing]);

  return (
    <section className="min-h-screen w-full bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* ✅ Banner Section */}
        {!hideBanner ? (
          <BannerProgress
            completeness={completeness}
            tone={tone}
            primaryAction={primaryAction}
            onClose={closeBanner}
            onCta={() => router.push(primaryAction.href)}
          />
        ) : null}

        {/* PROFILE HEADER */}
       <div className="bg-white shadow-xl p-8 text-center border border-gray-200 rounded-3xl">
  {/* Profile Image */}
  <div className="w-32 h-32 overflow-hidden border border-gray-200 shadow-inner mx-auto relative mb-4 bg-gray-50 rounded-full">
    <Image
      src={photoSrc}
      alt="Profile Photo"
      fill
      unoptimized
      onError={() => setPhotoSrc(FALLBACK_IMG)}
      className="object-cover"
      priority
    />
  </div>

  {/* Name */}
  <h2 className="text-2xl font-semibold text-gray-900">
    {safeName}
  </h2>

  {/* Email */}
  <p className="text-gray-500 text-sm mt-1">
    {formData.email}
  </p>

  {/* Quote */}
  <p className="text-gray-400 text-xs mt-3 italic px-4">
    {quote}
  </p>

  {/* Actions */}
  <div className="flex justify-center gap-4 mt-6 flex-wrap">
    <button
      onClick={() => router.push("/profile/edit")}
      className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm
                 rounded-xl shadow-md hover:bg-gray-900 transition"
    >
      <Edit3 size={16} />
      Edit Profile
    </button>

    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 text-sm
                 rounded-xl shadow-md hover:bg-red-700 transition"
    >
      <LogOut size={16} />
      Logout
    </button>
  </div>
</div>


        {/* ✅ SUPPORT TICKETS ROW */}
        <SupportTicketsRow email={formData.email} />

        {/* RECENT ORDERS */}
     <div className="bg-white p-6 shadow-lg border border-gray-200 rounded-3xl">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <ShoppingBag size={18} />
    Recent Orders
  </h3>

  {ordersLoading ? (
    <div className="text-sm text-gray-500">Loading orders...</div>
  ) : ordersError ? (
    <div className="text-sm text-red-600">
      Failed to load orders: {ordersError}
    </div>
  ) : recentOrders.length === 0 ? (
    <div className="text-sm text-gray-500">No orders yet.</div>
  ) : (
    <div className="space-y-4">
      {recentOrders.map((o) => {
        const pill = statusPill(o.fulfillmentStatus);

        return (
          <Link
            href={`/profile/orders/${o._id}`}
            key={o._id}
            className="p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm
                       flex justify-between items-center
                       hover:shadow-md hover:bg-white transition"
          >
            <div>
              <p className="font-medium text-gray-900">
                Order{" "}
                {o.orderNumber
                  ? `#${o.orderNumber}`
                  : `#${o._id?.slice(-6)}`}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(o.orderDate || o.createdAt)} • ₹
                {o.finalPayable ?? o.totalAmount ?? 0}
              </p>
            </div>

            <span
              className={`text-sm font-semibold rounded-full px-3 py-1 ${pill.cls}`}
            >
              {pill.label}
            </span>
          </Link>
        );
      })}
    </div>
  )}

  <Link
    href="/profile/orders"
    className="text-black flex items-center gap-1 text-sm mt-4
               hover:underline"
  >
    View All <ChevronRight size={14} />
  </Link>
</div>


        {/* SAVED ADDRESSES */}
       <div className="bg-white p-6 shadow-lg border border-gray-200 rounded-3xl">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <MapPin size={18} />
    Saved Addresses
  </h3>

  {addresses.length > 0 ? (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div
          key={addr._id}
          className="bg-gray-50 border border-gray-200 shadow-sm p-4 text-sm rounded-2xl
                     hover:bg-white hover:shadow-md transition"
        >
          <p className="font-semibold text-gray-900">{addr.fullName}</p>
          <p className="text-gray-700">{addr.phone}</p>
          <p className="text-gray-600 mt-1">
            {addr.addressLine1},{" "}
            {addr.addressLine2 && `${addr.addressLine2}, `}
            {addr.city}, {addr.state}, {addr.postalCode}
          </p>

          {addr.isDefaultShipping && (
            <span className="inline-block mt-3 text-[10px]
                             bg-green-100 text-green-700
                             px-2.5 py-1 rounded-full font-semibold">
              Default Shipping
            </span>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No saved addresses yet.</p>
  )}

  <button
    onClick={() => router.push("/profile/address")}
    className="flex items-center gap-1 text-black text-sm mt-4 hover:underline"
  >
    <Plus size={14} />
    Add New Address
  </button>
</div>


        {/* RECENTLY VIEWED */}
        <div className=" shadow-lg ">
          <RecentlyViewedRow />
        </div>
      </div>
    </section>
  );
}
