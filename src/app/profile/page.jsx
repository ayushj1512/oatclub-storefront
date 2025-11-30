"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import { useRouter } from "next/navigation";

import {
  Edit3,
  Save,
  LogOut,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Plus,
} from "lucide-react";

import RecentlyViewedRow from "@/components/profile/RecentlyViewedRow";

const BRAND = { burgundy: "#800020" };

const QUOTES = [
  "Fashion is the armor to survive the everyday ✨",
  "Style is who you are without speaking.",
  "Elegance begins the moment you decide to be yourself 💗",
  "Your vibe attracts your style.",
  "Wear something that makes you smile today 😊",
  "You are your best accessory.",
  "Confidence is your best outfit — wear it daily!",
  "Soft, simple, effortlessly beautiful 🌸",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, customer, isAuthenticated, loading, requestLogout } = useAuthStore();
  const { addresses, fetchAddresses } = useAddressStore();

  const [isEditing, setIsEditing] = useState(false);
  const [quote, setQuote] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });

  /* Random Fashion Quote */
  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  /* Auth Check + Auto Load Profile */
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push("/auth/login");
      } else {
        const safePhoto =
          user.photoURL && user.photoURL.length > 5
            ? user.photoURL
            : "/profile/user-avatar.jpg";

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: customer?.phone || "",
          photoURL: safePhoto,
        });

        // FETCH USER ADDRESSES
        fetchAddresses(user.uid);
      }
    }
  }, [loading, user, isAuthenticated]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated (This will be connected to backend soon)");
  };

  const handleLogout = () => requestLogout();

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        Loading profile...
      </div>
    );

  if (!user) return null;

  const safeName =
    formData.name.length > 1
      ? formData.name.charAt(0).toUpperCase() + formData.name.slice(1)
      : "User";

  return (
    <section className="w-full min-h-screen bg-gray-50 flex justify-center py-6 px-4">
      <div className="w-full max-w-3xl space-y-6">

        {/* HEADER QUOTE */}
        <p className="text-center text-xs text-gray-500 italic">{quote}</p>

        {/* PROFILE CARD */}
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border border-gray-300">
            <Image
              src={formData.photoURL || "/profile/user-avatar.jpg"}
              alt="Profile Photo"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-xl font-bold text-gray-900">{safeName}</h2>
          <p className="text-gray-500 text-sm">{formData.email}</p>

          <div className="flex items-center justify-center gap-3 mt-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-md text-sm shadow"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm shadow"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-md text-sm shadow"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShoppingBag size={16} className="text-[#800020]" />
            Recent Orders
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-800">Order #2031</p>
                <p className="text-[11px] text-gray-500">Nov 10, 2025</p>
              </div>
              <p className="text-xs font-semibold text-green-600">Delivered</p>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-800">Order #2018</p>
                <p className="text-[11px] text-gray-500">Oct 28, 2025</p>
              </div>
              <p className="text-xs font-semibold text-yellow-600">In Transit</p>
            </div>
          </div>

          <Link
            href="/profile/orders"
            className="text-[#800020] text-xs inline-flex items-center gap-1 mt-3"
          >
            View All <ChevronRight size={12} />
          </Link>
        </div>

        {/* ADDRESSES BLOCK */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-[#800020]" />
            Saved Addresses
          </h3>

          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-gray-50 p-3 rounded-lg border shadow-sm text-sm text-gray-800"
                >
                  <p className="font-semibold text-gray-900">{addr.fullName}</p>
                  <p>{addr.phone}</p>
                  <p>
                    {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                    {addr.city}, {addr.state}, {addr.postalCode}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Type: {addr.addressType.toUpperCase()}
                  </p>
                  {addr.isDefaultShipping && (
                    <span className="inline-block mt-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Default Shipping
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-xs">No saved addresses yet.</p>
          )}

          {/* ADD ADDRESS BUTTON */}
          <button
            onClick={() => router.push("/profile/address")}
            className="flex items-center gap-1 text-[#800020] text-xs mt-3 hover:underline"
          >
            <Plus size={12} /> Add New Address
          </button>
        </div>

        {/* RECENTLY VIEWED */}
        <RecentlyViewedRow />
      </div>
    </section>
  );
}
