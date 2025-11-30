"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function ProfileMenu() {
  const { user, isAuthenticated, requestLogout } = useAuthStore?.() || {
    user: null,
    isAuthenticated: false,
    requestLogout: () => {},
  };

  const [showProfile, setShowProfile] = useState(false);

  return (
    <div
      className="relative inline-block py-2"
      onMouseEnter={() => setShowProfile(true)}
      onMouseLeave={() => setShowProfile(false)}
    >
      {/* Profile Icon */}
      <div className="cursor-pointer flex items-center">
        <User className="w-6 h-6 text-gray-700 hover:text-[#800020] transition" />
      </div>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-xl shadow-xl p-5 z-50 transition-all duration-200 origin-top
          ${showProfile ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {/* User Info */}
        <div className="flex flex-col gap-1 mb-3">
          {isAuthenticated ? (
            <>
              <p className="text-gray-900 font-semibold text-[15px]">{user?.name || "User"}</p>
              <p className="text-gray-500 text-sm">{user?.email || "No email available"}</p>
            </>
          ) : (
            <p className="text-gray-600 text-sm">You are not logged in</p>
          )}
        </div>

        <hr className="border-gray-200 mb-3" />

        {/* View Profile */}
        <Link
          href="/profile"
          className="block w-full text-center bg-[#800020] text-white py-2 rounded-lg hover:bg-[#6a001a] transition text-sm"
        >
          View Profile
        </Link>

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={() => requestLogout()} // ⭐ OPEN CONFIRMATION MODAL
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
