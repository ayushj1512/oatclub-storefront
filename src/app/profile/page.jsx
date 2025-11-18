"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Save,
  LogOut,
  ShoppingBag,
  User,
  MapPin,
  Heart,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photoURL: "",
  });

  // Load user data
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push("/auth/login");
      } else {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          photoURL: user.photoURL || "/profile/user-avatar.jpg",
        });
      }
    }
  }, [loading, user, isAuthenticated]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully! (Local only for now)");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-600">
        Loading profile...
      </div>
    );

  if (!user) return null;

  return (
    <section className="w-full px-5 py-10 flex flex-col gap-6 bg-white">
      {/* ================================================================================= */}
      {/* PROFILE HEADER */}
      {/* ================================================================================= */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-3xl p-6 flex flex-col items-center text-center border border-gray-100">
        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-[#b08c92]">
          <Image
            src={formData.photoURL}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">
          {formData.name}
        </h2>
        <p className="text-gray-500 text-sm">{formData.email}</p>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 flex items-center gap-2 bg-[#800020] text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-[#6a001a] transition"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-green-700 transition"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 mt-4 transition text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* ================================================================================= */}
      {/* PERSONAL INFORMATION */}
      {/* ================================================================================= */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-3xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-[#800020]" />
          Personal Information
        </h3>

        <div className="flex flex-col gap-5">
          {["name", "email", "phone", "address"].map((field) => (
            <div key={field}>
              <label className="text-sm text-gray-500 capitalize">
                {field}
              </label>

              {isEditing ? (
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={field === "email"}
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-[#800020] outline-none disabled:bg-gray-100"
                />
              ) : (
                <p className="text-gray-800 font-medium mt-1">
                  {formData[field] || "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================================= */}
      {/* RECENTLY VIEWED */}
      {/* ================================================================================= */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-3xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-[#800020]" />
          Recently Viewed
        </h3>

        <div className="text-gray-600 text-sm">No recently viewed items yet.</div>

        <Link
          href="/products"
          className="text-[#800020] text-sm mt-2 inline-flex items-center gap-1 hover:underline"
        >
          Browse Products <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ================================================================================= */}
      {/* RECENT ORDERS */}
      {/* ================================================================================= */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-3xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-[#800020]" />
          Recent Orders
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm text-gray-800 font-medium">Order #INV-2031</p>
              <p className="text-xs text-gray-500">Placed on Nov 10, 2025</p>
            </div>
            <p className="text-sm font-semibold text-green-600">Delivered</p>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm text-gray-800 font-medium">Order #INV-2018</p>
              <p className="text-xs text-gray-500">Placed on Oct 28, 2025</p>
            </div>
            <p className="text-sm font-semibold text-yellow-600">In Transit</p>
          </div>
        </div>

        <Link
          href="/orders"
          className="text-[#800020] text-sm mt-3 inline-flex items-center gap-1 hover:underline"
        >
          View All Orders <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ================================================================================= */}
      {/* SAVED ADDRESSES */}
      {/* ================================================================================= */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-3xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#800020]" />
          Saved Addresses
        </h3>

        {formData.address ? (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800 text-sm leading-relaxed">
            {formData.address}
          </div>
        ) : (
          <div className="text-gray-600 text-sm">No saved addresses.</div>
        )}

        <button className="mt-3 text-[#800020] text-sm hover:underline">
          + Add New Address
        </button>
      </div>
    </section>
  );
}
