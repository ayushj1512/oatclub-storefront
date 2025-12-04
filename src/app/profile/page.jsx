// src/app/profile/page.jsx (or wherever your ProfilePage file lives)
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { useRouter } from "next/navigation";
import { Edit3, LogOut, ShoppingBag, MapPin, ChevronRight, Plus } from "lucide-react";
import RecentlyViewedRow from "@/components/profile/RecentlyViewedRow";

// ✅ NEW: Support row component
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
    return { label: s === "out_for_delivery" ? "Out for delivery" : "Shipped", cls: "text-blue-600" };
  if (s === "packed" || s === "processing")
    return { label: s === "packed" ? "Packed" : "Processing", cls: "text-yellow-600" };
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

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // Redirect if not logged in + load profile basics
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user?.uid) {
      router.push("/auth/login");
      return;
    }

    setFormData({
      name: user?.name || "",
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

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 text-lg">
        Loading profile...
      </div>
    );

  if (!user) return null;

  const safeName =
    formData.name?.length > 1
      ? formData.name.charAt(0).toUpperCase() + formData.name.slice(1)
      : "User";

  const recentOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.slice(0, 2);
  }, [orders]);

  return (
    <section className="min-h-screen w-full bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* PROFILE HEADER */}
        <div className="bg-white shadow-xl p-8 text-center border border-gray-200">
          <div className="w-32 h-32 overflow-hidden border shadow-inner mx-auto relative mb-4 bg-gray-50 rounded-full">
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

          <h2 className="text-2xl font-semibold text-gray-900">{safeName}</h2>
          <p className="text-gray-500 text-sm mt-1">{formData.email}</p>
          <p className="text-gray-400 text-xs mt-3 italic">{quote}</p>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => router.push("/profile/edit")}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm shadow-md hover:bg-gray-900 transition"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 text-sm shadow-md hover:bg-red-700 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* ✅ SUPPORT TICKETS ROW (NEW) */}
        <SupportTicketsRow email={formData.email} />

        {/* RECENT ORDERS */}
        <div className="bg-white p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} />
            Recent Orders
          </h3>

          {ordersLoading ? (
            <div className="text-sm text-gray-500">Loading orders...</div>
          ) : ordersError ? (
            <div className="text-sm text-red-600">Failed to load orders: {ordersError}</div>
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
                    className="p-4 bg-gray-50 border shadow-sm flex justify-between items-center hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Order {o.orderNumber ? `#${o.orderNumber}` : `#${o._id?.slice(-6)}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(o.orderDate || o.createdAt)} • ₹{o.finalPayable ?? o.totalAmount ?? 0}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${pill.cls}`}>{pill.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <Link
            href="/profile/orders"
            className="text-black flex items-center gap-1 text-sm mt-4 hover:underline"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {/* SAVED ADDRESSES */}
        <div className="bg-white p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} />
            Saved Addresses
          </h3>

          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr._id} className="bg-gray-50 border shadow-sm p-4 text-sm">
                  <p className="font-semibold text-gray-900">{addr.fullName}</p>
                  <p>{addr.phone}</p>
                  <p>
                    {addr.addressLine1},{" "}
                    {addr.addressLine2 && `${addr.addressLine2}, `}
                    {addr.city}, {addr.state}, {addr.postalCode}
                  </p>

                  {addr.isDefaultShipping && (
                    <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5">
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
        <div className="bg-white p-6 shadow-lg border border-gray-200">
          <RecentlyViewedRow />
        </div>
      </div>
    </section>
  );
}
