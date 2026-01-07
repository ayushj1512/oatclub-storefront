"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProfileMenu() {
  const router = useRouter();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  // ✅ Auth store data (safe fallback)
  const { user, isAuthenticated, requestLogout } = useAuthStore?.() || {
    user: null,
    isAuthenticated: false,
    requestLogout: () => {},
  };

  // ✅ Detect mobile/touch devices
  const isMobile = useMemo(
    () =>
      typeof window === "undefined"
        ? false
        : window.matchMedia?.("(pointer: coarse)")?.matches ?? false,
    []
  );

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ✅ Click: mobile → navigate | desktop → dropdown
  const onIconClick = () => {
    if (isMobile) return router.push("/profile");
    setOpen((s) => !s);
  };

  return (
    <div className="relative inline-block py-2" ref={ref}>
      {/* Profile Icon */}
      <button type="button" onClick={onIconClick} className="flex items-center">
        <User className="w-6 h-6 text-gray-700 hover:text-black transition" />
      </button>

      {/* Dropdown (Desktop only) */}
      {open && !isMobile && (
        <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-5 z-50">
          {/* User Info */}
          <div className="mb-3">
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

          {/* Profile Link */}
          <Link
            href="/profile"
            onClick={() => setOpen(false)} // ✅ close dropdown when navigating
            className="block w-full text-center bg-black text-white py-2 rounded-lg hover:bg-black/90 transition text-sm font-medium"
          >
            View Profile
          </Link>

          {/* Logout button */}
          {isAuthenticated && (
            <button
              onClick={() => {
                setOpen(false);
                requestLogout();
              }}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}
