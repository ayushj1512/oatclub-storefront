// src/app/profile/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  if (s === "delivered") return { label: "Delivered", cls: "text-green-600 bg-green-50 border-green-200" };
  if (s === "shipped" || s === "out_for_delivery")
    return {
      label: s === "out_for_delivery" ? "Out for delivery" : "Shipped",
      cls: "text-blue-600 bg-blue-50 border-blue-200",
    };
  if (s === "packed" || s === "processing")
    return {
      label: s === "packed" ? "Packed" : "Processing",
      cls: "text-yellow-700 bg-yellow-50 border-yellow-200",
    };
  if (s === "returned") return { label: "Returned", cls: "text-purple-700 bg-purple-50 border-purple-200" };
  if (s === "cancelled") return { label: "Cancelled", cls: "text-red-700 bg-red-50 border-red-200" };
  return { label: status || "Pending", cls: "text-gray-700 bg-gray-50 border-gray-200" };
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

  return { pct, missing };
}

function progressTone(pct) {
  if (pct >= 90) {
    return { bar: "bg-black", badge: "bg-white text-black border-black/20", msg: "All set!", border: "border-black/10" };
  }
  if (pct >= 60) {
    return { bar: "bg-rose-800", badge: "bg-rose-50 text-rose-900 border-rose-200", msg: "Almost there", border: "border-rose-200" };
  }
  if (pct >= 30) {
    return { bar: "bg-rose-700", badge: "bg-rose-50 text-rose-900 border-rose-200", msg: "Complete it", border: "border-rose-200" };
  }
  return { bar: "bg-red-700", badge: "bg-red-50 text-red-800 border-red-200", msg: "Add details", border: "border-red-200" };
}

/* ------------------------------ */
/* ✅ Compact Banner Progress      */
/* ------------------------------ */
function BannerProgress({ completeness, tone, primaryAction, onClose, onCta }) {
  if (!completeness) return null;

  return (
    <div className={`bg-white border ${tone.border} rounded-2xl p-4 sm:p-5 shadow-sm relative`}>
      {/* close */}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 p-2 rounded-xl hover:bg-black/5 transition"
        aria-label="Close"
        title="Close"
      >
        <X size={18} className="text-gray-700" />
      </button>

      <div className="flex items-start gap-3 pr-10">
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl">
          <ShieldCheck size={18} className="text-gray-900" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              Complete your profile
            </h3>
            <span className={`text-[11px] px-2 py-1 rounded-full border ${tone.badge}`}>
              {tone.msg}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Faster checkout & smoother deliveries with complete details.
          </p>

          {/* ✅ progress bar (stable) */}
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-2 ${tone.bar}`} style={{ width: `${completeness.pct}%` }} />
            </div>
            <div className="flex justify-between mt-2 items-center">
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Sparkles size={13} className="text-gray-700" />
                {completeness.pct}% done
              </div>

              <button
                onClick={onCta}
                className="bg-black text-white px-3 py-1.5 text-xs rounded-xl shadow-sm hover:bg-gray-900 transition"
              >
                {primaryAction.label}
              </button>
            </div>
          </div>

          {/* missing chips (compact, mobile friendly) */}
          {completeness?.missing?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {completeness.missing.slice(0, 4).map((m) => (
                <Link
                  key={m.key}
                  href={m.action?.href || "/profile/edit"}
                  className="text-[11px] bg-gray-50 border border-gray-200 px-2 py-1 rounded-full hover:bg-white transition"
                >
                  {m.label}
                </Link>
              ))}
              {completeness.missing.length > 4 && (
                <span className="text-[11px] text-gray-500">
                  +{completeness.missing.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
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

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const [hideBanner, setHideBanner] = useState(false);
  const intervalRef = useRef(null);

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

  // Redirect + load basics
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
  }, [loading, isAuthenticated, user?.uid, customer?._id, fetchAddresses, router, user, customer]);

  // Update photo if changes
  useEffect(() => {
    if (!isAuthenticated) return;
    setPhotoSrc(buildSafePhotoURL(customer, user));
  }, [isAuthenticated, customer?.profileImage, user?.photoURL, customer, user]);

  // ✅ Orders polling optimized: only when tab visible (prevents lag on mobile)
  useEffect(() => {
    if (loading || !isAuthenticated || !customer?._id) return;

    const run = () => fetchMyOrders(customer._id);
    run();

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(run, 30000); // ✅ 30 sec (lighter)
    };

    const stopPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const onVis = () => {
      if (document.visibilityState === "visible") {
        run();
        startPolling();
      } else {
        stopPolling();
      }
    };

    onVis();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVis);
    };
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
    return first?.action || { label: "Update", href: "/profile/edit" };
  }, [completeness.missing]);

  return (
    <section className="min-h-screen w-full bg-[#F5F6FA] px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* ✅ Banner */}
        {!hideBanner ? (
          <BannerProgress
            completeness={completeness}
            tone={tone}
            primaryAction={primaryAction}
            onClose={closeBanner}
            onCta={() => router.push(primaryAction.href)}
          />
        ) : null}

        {/* ✅ Profile header (compact) */}
       <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
  <div className="flex flex-col items-center text-center gap-4">
    {/* ✅ Profile Image (Center) */}
    <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-gray-200 bg-gray-50 rounded-full relative">
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

    {/* ✅ Name / Email / Quote (Center) */}
    <div className="w-full">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
        {safeName}
      </h2>
      <p className="text-gray-500 text-sm mt-1">{formData.email}</p>

      <p className="text-gray-400 text-xs mt-2 italic line-clamp-2 px-2">
        {quote}
      </p>

      {/* ✅ Buttons (Center) */}
      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        <button
          onClick={() => router.push("/profile/edit")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm rounded-xl hover:bg-gray-900 transition"
        >
          <Edit3 size={16} />
          Edit
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-sm rounded-xl hover:bg-red-700 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  </div>
</div>


        {/* ✅ Support Tickets */}
        <SupportTicketsRow email={formData.email} />

        {/* ✅ Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={18} />
              Recent Orders
            </h3>
            <Link
              href="/profile/orders"
              className="text-sm text-black hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="text-sm text-gray-500">Loading orders...</div>
          ) : ordersError ? (
            <div className="text-sm text-red-600">
              Failed to load orders: {ordersError}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => {
                const pill = statusPill(o.fulfillmentStatus);

                return (
                  <Link
                    href={`/profile/orders/${o._id}`}
                    key={o._id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:bg-white transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Order{" "}
                        {o.orderNumber ? `#${o.orderNumber}` : `#${o._id?.slice(-6)}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(o.orderDate || o.createdAt)} • ₹
                        {o.finalPayable ?? o.totalAmount ?? 0}
                      </p>
                    </div>

                    <span className={`text-xs font-semibold border px-2 py-1 rounded-full ${pill.cls}`}>
                      {pill.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ✅ Saved Addresses */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={18} />
              Saved Addresses
            </h3>

            <button
              onClick={() => router.push("/profile/address")}
              className="text-sm text-black hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {addresses?.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-gray-50 border border-gray-200 p-3 text-sm rounded-2xl"
                >
                  <p className="font-semibold text-gray-900">{addr.fullName}</p>
                  <p className="text-gray-700 text-xs">{addr.phone}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {addr.addressLine1},{" "}
                    {addr.addressLine2 && `${addr.addressLine2}, `}
                    {addr.city}, {addr.state}, {addr.postalCode}
                  </p>

                  {addr.isDefaultShipping && (
                    <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      Default Shipping
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No saved addresses yet.</p>
          )}
        </div>

        {/* ✅ Recently Viewed */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-5 shadow-sm">
          <RecentlyViewedRow />
        </div>
      </div>
    </section>
  );
}
