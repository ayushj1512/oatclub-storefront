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
      <button type="button" onClick={onIconClick} className="flex items-center text-black transition hover:text-black/55">
        <User className="h-6 w-6 text-black transition" />
      </button>

      {/* Dropdown (Desktop only) */}
      {open && !isMobile && (
        <div className="absolute right-0 z-50 mt-3 w-72 border border-black/10 bg-white p-5 shadow-[0_24px_80px_-38px_rgba(0,0,0,0.28)]">
          {/* User Info */}
          <div className="mb-3">
            {isAuthenticated ? (
              <>
                <p className="text-[13px] font-black uppercase tracking-[0.08em] text-black">{user?.name || "USER"}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.06em] text-black/45">{user?.email || "NO EMAIL AVAILABLE"}</p>
              </>
            ) : (
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-black/55">YOU ARE NOT LOGGED IN</p>
            )}
          </div>

          <hr className="mb-3 border-black/10" />

          {/* Profile Link */}
          <Link
            href="/profile"
            onClick={() => setOpen(false)} // ✅ close dropdown when navigating
            className="block w-full bg-black py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-black/85"
          >
            VIEW PROFILE
          </Link>

          {/* Logout button */}
          {isAuthenticated && (
            <button
              onClick={() => {
                setOpen(false);
                requestLogout();
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 border border-black/10 py-2 text-xs font-black uppercase tracking-[0.14em] text-black/60 transition hover:border-black hover:text-black"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          )}
        </div>
      )}
    </div>
  );
}
