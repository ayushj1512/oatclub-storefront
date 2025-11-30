"use client";

import "./globals.css";
import { Poppins } from "next/font/google";

import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ClientProviders from "@/components/layout/ClientProviders";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

import SignupModal from "@/components/auth/SignupModal";
import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal"; // ⭐ ADDED

// Google Font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

// ------------------------------
// 🔥 Initialize Auth Store on App Load
// ------------------------------
function AuthInit() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

// ------------------------------
// 🌐 ROOT LAYOUT
// ------------------------------
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">

        {/* ---------- DESKTOP HEADER ---------- */}
        <div className="hidden md:block">
          <DesktopHeader />
        </div>

        {/* ---------- MOBILE HEADER ---------- */}
        <div className="md:hidden">
          <MobileHeader />
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <main className="flex flex-col min-h-screen bg-white pt-[40px] md:pt-[60px]">
          {children}
        </main>

        {/* ---------- FOOTER ---------- */}
        <Footer />

        {/* ---------- GLOBAL PROVIDERS ---------- */}
        <ClientProviders>
          <AuthInit />
          <ScrollToTop />
        </ClientProviders>

        {/* ---------- SIGNUP MODAL (GLOBAL) ---------- */}
        <SignupModal />

        {/* ---------- LOGOUT CONFIRM MODAL (GLOBAL) ---------- */}
        <LogoutConfirmModal />

      </body>
    </html>
  );
}
