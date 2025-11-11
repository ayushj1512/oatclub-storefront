"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Save, LogOut, ShoppingBag, User } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "Ayush Juneja",
    email: "ayush@mirayfashions.com",
    phone: "+91 9876543210",
    address: "B-12, South Delhi, India",
    profileImage: "/profile/user-avatar.jpg",
  });

  const [formData, setFormData] = useState(user);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogout = () => {
    alert("You have been logged out!");
    // later: clear auth token / redirect to login
  };

  return (
    <section className="w-full flex flex-col md:flex-row justify-between bg-gray-50 px-6 py-10 gap-10 min-h-[80vh]">
      {/* LEFT SIDE — USER PROFILE */}
      <div className="flex flex-col bg-white rounded-3xl shadow-sm p-6 md:w-[40%] w-full items-center">
        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-pink-100">
          <Image
            src={user.profileImage}
            alt="Profile"
            fill
            className="object-cover object-center"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {user.name}
        </h2>
        <p className="text-gray-500 text-sm mb-6">{user.email}</p>

        {/* Buttons */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-medium text-sm transition"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full font-medium text-sm transition"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 mt-6 transition text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* RIGHT SIDE — USER DETAILS + ORDERS */}
      <div className="flex flex-col bg-white rounded-3xl shadow-sm p-6 md:w-[60%] w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-pink-500" />
          Personal Information
        </h3>

        <div className="flex flex-col gap-4">
          {/* Editable fields */}
          {["name", "email", "phone", "address"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm text-gray-500 capitalize">
                {field}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-pink-400 outline-none"
                />
              ) : (
                <p className="text-gray-800 font-medium mt-1">
                  {user[field]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ORDERS SECTION */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            Recent Orders
          </h3>

          {/* Mock order list */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Order #INV-2031
                </p>
                <p className="text-xs text-gray-500">Placed on Nov 10, 2025</p>
              </div>
              <p className="text-sm font-semibold text-green-600">Delivered</p>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Order #INV-2018
                </p>
                <p className="text-xs text-gray-500">Placed on Oct 28, 2025</p>
              </div>
              <p className="text-sm font-semibold text-yellow-500">In Transit</p>
            </div>
          </div>

          <Link
            href="/orders"
            className="text-pink-500 hover:underline text-sm mt-4 inline-block"
          >
            View All Orders →
          </Link>
        </div>
      </div>
    </section>
  );
}
