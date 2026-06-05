// src/app/profile/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CreditCard,
  Edit3,
  Headphones,
  Heart,
  LogOut,
  MapPin,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import OrderHelpCard from "@/components/profile/OrderHelpCard";
import ProfileCreditCard from "@/components/profile/ProfileCreditCard";
import RecentlyViewedRow from "@/components/profile/RecentlyViewedRow";
import SupportTicketsRow from "@/components/profile/SupportTicketsRow";

const FALLBACK_IMG =
  "https://i.pinimg.com/736x/54/5c/c1/545cc16292db0d62ac333fc422e4aff4.jpg";

const QUOTES = [
  "YOUR OATCLUB EDIT IS READY.",
  "STYLE STARTS WITH THE DETAILS.",
  "WELCOME TO YOUR WARDROBE DASHBOARD.",
  "CURATED FOR YOUR NEXT MOVE.",
  "YOUR ACCOUNT, YOUR EDIT, YOUR FLOW.",
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

function money(value) {
  const n = Number(value || 0);
  return `RS. ${n.toLocaleString("en-IN")}`;
}

function statusPill(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return { label: "DELIVERED", cls: "text-black bg-neutral-100 border-neutral-200" };
  if (s === "shipped" || s === "out_for_delivery") {
    return {
      label: s === "out_for_delivery" ? "OUT FOR DELIVERY" : "SHIPPED",
      cls: "text-black bg-neutral-100 border-neutral-200",
    };
  }
  if (s === "packed" || s === "processing") {
    return {
      label: s === "packed" ? "PACKED" : "PROCESSING",
      cls: "text-black bg-neutral-100 border-neutral-200",
    };
  }
  if (s === "returned") return { label: "RETURNED", cls: "text-black bg-neutral-100 border-neutral-200" };
  if (s === "cancelled") return { label: "CANCELLED", cls: "text-black bg-neutral-100 border-neutral-200" };
  return { label: String(status || "PENDING").toUpperCase(), cls: "text-black bg-neutral-100 border-neutral-200" };
}

function buildSafePhotoURL(customer, user) {
  const raw =
    (customer?.profileImage && String(customer.profileImage).trim()) ||
    (user?.photoURL && String(user.photoURL).trim()) ||
    "";

  if (!raw || raw.length < 6 || raw === "null" || raw === "undefined") return FALLBACK_IMG;
  return raw;
}

function isFilled(v) {
  if (v == null) return false;
  const s = String(v).trim();
  return s.length > 0 && s !== "null" && s !== "undefined";
}

function calcProfileCompleteness({ user, customer, addresses }) {
  const items = [
    { key: "name", label: "NAME", weight: 20, ok: isFilled(user?.name || user?.displayName || customer?.name), action: { label: "EDIT PROFILE", href: "/profile/edit" } },
    { key: "email", label: "EMAIL", weight: 15, ok: isFilled(user?.email || customer?.email), action: { label: "EDIT PROFILE", href: "/profile/edit" } },
    { key: "phone", label: "PHONE", weight: 15, ok: isFilled(customer?.phone), action: { label: "ADD PHONE", href: "/profile/edit" } },
    { key: "dob", label: "DOB", weight: 10, ok: isFilled(customer?.dateOfBirth), action: { label: "ADD DOB", href: "/profile/edit" } },
    { key: "gender", label: "GENDER", weight: 5, ok: isFilled(customer?.gender) && customer?.gender !== "unknown", action: { label: "SET GENDER", href: "/profile/edit" } },
    { key: "city", label: "CITY", weight: 10, ok: isFilled(customer?.city), action: { label: "ADD CITY", href: "/profile/edit" } },
    { key: "state", label: "STATE", weight: 10, ok: isFilled(customer?.state), action: { label: "ADD STATE", href: "/profile/edit" } },
    { key: "country", label: "COUNTRY", weight: 5, ok: isFilled(customer?.country), action: { label: "ADD COUNTRY", href: "/profile/edit" } },
    { key: "address", label: "ADDRESS", weight: 10, ok: Array.isArray(addresses) && addresses.length > 0, action: { label: "ADD ADDRESS", href: "/profile/address" } },
  ];

  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const score = items.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0);
  const pct = total ? Math.round((score / total) * 100) : 0;
  return { pct, missing: items.filter((item) => !item.ok) };
}

function progressTone(pct) {
  if (pct >= 90) return { msg: "ALL SET", border: "border-black/10" };
  if (pct >= 60) return { msg: "ALMOST THERE", border: "border-black/10" };
  if (pct >= 30) return { msg: "COMPLETE IT", border: "border-black/10" };
  return { msg: "ADD DETAILS", border: "border-black/10" };
}

function BannerProgress({ completeness, tone, primaryAction, onClose, onCta }) {
  if (!completeness) return null;

  return (
    <div className={`relative border ${tone.border} bg-white p-3 sm:p-4`}>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 p-2 transition hover:bg-black/5"
        aria-label="Close"
        title="Close"
      >
        <X size={16} className="text-black/60" />
      </button>

      <div className="flex gap-3 pr-8">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50">
          <ShieldCheck size={17} className="text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-black">
              COMPLETE YOUR PROFILE
            </h3>
            <span className="border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-black/55">
              {tone.msg}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-bold uppercase leading-4 tracking-[0.08em] text-black/45">
            FASTER CHECKOUT AND SMOOTHER DELIVERIES.
          </p>

          <div className="mt-3 h-1.5 w-full overflow-hidden bg-neutral-100">
            <div className="h-full bg-black" style={{ width: `${completeness.pct}%` }} />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-black/55">
              <Sparkles size={12} />
              {completeness.pct}% DONE
            </span>
            <button
              onClick={onCta}
              className="bg-black px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
            >
              {primaryAction.label}
            </button>
          </div>
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
      if (localStorage.getItem("oatclub_profile_progress_banner") === "hidden") setHideBanner(true);
    } catch {}
  }, []);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
    try {
      localStorage.setItem("oatclub_profile_progress_banner", "hidden");
    } catch {}
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user?.uid) {
      router.push("/auth/login");
      return;
    }

    setFormData({
      name: user?.name || user?.displayName || customer?.name || "",
      email: user?.email || customer?.email || "",
      phone: customer?.phone || "",
    });

    setPhotoSrc(buildSafePhotoURL(customer, user));
    fetchAddresses(user.uid);
  }, [loading, isAuthenticated, user?.uid, customer?._id, fetchAddresses, router, user, customer]);

  useEffect(() => {
    if (isAuthenticated) setPhotoSrc(buildSafePhotoURL(customer, user));
  }, [isAuthenticated, customer?.profileImage, user?.photoURL, customer, user]);

  useEffect(() => {
    if (loading || !isAuthenticated || !customer?._id) return;

    const run = () => fetchMyOrders(customer._id);
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(run, 30000);
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

  const safeName = useMemo(() => {
    const name = String(formData.name || "USER").trim();
    return name.length > 1 ? name.toUpperCase() : "USER";
  }, [formData.name]);

  const recentOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.slice(0, 2);
  }, [orders]);

  const completeness = useMemo(
    () => calcProfileCompleteness({ user, customer, addresses }),
    [user, customer, addresses]
  );

  const tone = useMemo(() => progressTone(completeness.pct), [completeness.pct]);

  const primaryAction = useMemo(() => {
    const first = completeness.missing?.[0];
    return first?.action || { label: "UPDATE", href: "/profile/edit" };
  }, [completeness.missing]);

  const statCards = useMemo(
    () => [
      { label: "ORDERS", value: Array.isArray(orders) ? orders.length : 0 },
      { label: "ADDRESSES", value: addresses?.length || 0 },
      { label: "PROFILE", value: `${completeness.pct}%` },
    ],
    [orders, addresses?.length, completeness.pct]
  );

  const quickActions = [
    { label: "ORDERS", href: "/profile/orders", icon: ShoppingBag },
    { label: "EDIT", href: "/profile/edit", icon: UserRound },
    { label: "ADDRESS", href: "/profile/address", icon: MapPin },
    { label: "CREDITS", href: "/profile/credit", icon: CreditCard },
    { label: "WISHLIST", href: "/wishlist", icon: Heart },
    { label: "SUPPORT", href: "/profile/support", icon: Headphones },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f7f5] text-sm font-black uppercase tracking-[0.18em] text-black/50">
        LOADING PROFILE...
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="min-h-screen w-full bg-[#f7f7f5] px-3 py-4 text-black sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
        {!hideBanner ? (
          <BannerProgress
            completeness={completeness}
            tone={tone}
            primaryAction={primaryAction}
            onClose={closeBanner}
            onCta={() => router.push(primaryAction.href)}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border border-neutral-200 bg-white">
            <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex items-center justify-center border-b border-neutral-200 bg-neutral-50 p-5 md:border-b-0 md:border-r">
                <div className="relative h-24 w-24 overflow-hidden border border-neutral-200 bg-white sm:h-32 sm:w-32">
                  <Image
                    src={photoSrc}
                    alt="Profile Photo"
                    fill
                    unoptimized
                    priority
                    className="object-cover"
                    onError={() => setPhotoSrc(FALLBACK_IMG)}
                  />
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/45">
                      MEMBER DASHBOARD
                    </p>
                    <h1 className="mt-2 text-2xl font-black uppercase leading-none text-black sm:text-4xl">
                      {safeName}
                    </h1>
                    <p className="mt-2 break-all text-xs font-bold uppercase tracking-[0.08em] text-black/45">
                      {formData.email || "EMAIL NOT ADDED"}
                    </p>
                    <p className="mt-4 max-w-xl text-xs font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
                      {quote}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href="/profile/edit"
                      className="inline-flex h-10 items-center gap-2 bg-black px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
                    >
                      <Edit3 size={15} />
                      EDIT
                    </Link>
                    <button
                      onClick={() => requestLogout()}
                      className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:border-black"
                    >
                      <LogOut size={15} />
                      LOGOUT
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 border border-neutral-200">
                  {statCards.map((stat) => (
                    <div key={stat.label} className="border-r border-neutral-200 p-3 last:border-r-0 sm:p-4">
                      <p className="text-lg font-black leading-none text-black sm:text-2xl">{stat.value}</p>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-black/45">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
                  QUICK ACCESS
                </p>
                <h2 className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-black">
                  YOUR EDIT
                </h2>
              </div>
              <ShieldCheck size={18} className="text-black/60" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-2">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex min-h-20 flex-col justify-between border border-neutral-200 bg-neutral-50 p-3 transition hover:border-black hover:bg-white"
                >
                  <Icon size={18} className="text-black" />
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black/65 group-hover:text-black">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <ProfileCreditCard customer={customer} />
            <SupportTicketsRow email={formData.email} />
          </div>

          <div className="border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-black">
                <ShoppingBag size={17} />
                RECENT ORDERS
              </h3>
              <Link
                href="/profile/orders"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-black/55 hover:text-black"
              >
                VIEW ALL <ChevronRight size={14} />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                LOADING ORDERS...
              </div>
            ) : ordersError ? (
              <div className="border border-neutral-200 bg-neutral-50 p-4 text-xs font-bold uppercase text-red-600">
                FAILED TO LOAD ORDERS: {ordersError}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
                <PackageCheck size={22} className="mx-auto text-black/45" />
                <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-black">NO ORDERS YET</p>
                <Link
                  href="/all-clothing"
                  className="mt-3 inline-flex bg-black px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white"
                >
                  START SHOPPING
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const pill = statusPill(order.fulfillmentStatus);
                  return (
                    <Link
                      href={`/profile/orders/${order.orderNumber || order._id}`}
                      key={order._id}
                      className="flex items-center justify-between gap-3 border border-neutral-200 bg-neutral-50 p-3 transition hover:border-black hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black uppercase tracking-[0.08em] text-black">
                          #{order.orderNumber || order._id?.slice(-6)}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
                          {formatDate(order.orderDate || order.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-block border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${pill.cls}`}>
                          {pill.label}
                        </span>
                        <p className="mt-1 text-xs font-black text-black">
                          {money(order.finalPayable ?? order.totalAmount)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <OrderHelpCard />

        <div className="border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-black">
              <MapPin size={18} />
              SAVED ADDRESSES
            </h3>
            <button
              onClick={() => router.push("/profile/address")}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-black/55 hover:text-black"
            >
              <Plus size={14} />
              ADD
            </button>
          </div>

          {addresses?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.slice(0, 4).map((addr) => (
                <div key={addr._id} className="border border-neutral-200 bg-neutral-50 p-3 text-sm">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-black">
                    {addr.fullName}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">
                    {addr.phone}
                  </p>
                  <p className="mt-2 text-[11px] font-bold uppercase leading-5 tracking-[0.08em] text-black/55">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state}, {addr.postalCode}
                  </p>
                  {addr.isDefaultShipping && (
                    <span className="mt-3 inline-block border border-neutral-200 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-black/55">
                      DEFAULT SHIPPING
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
              NO SAVED ADDRESSES YET.
            </p>
          )}
        </div>

        <div className="border border-neutral-200 bg-white p-3 sm:p-5">
          <RecentlyViewedRow />
        </div>
      </div>
    </section>
  );
}
