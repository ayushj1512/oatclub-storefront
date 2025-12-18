"use client";

import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";

import TopbarHeadline from "@/components/layout/TopbarHeadline";
import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBNB from "@/components/layout/MobileBNB";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ClientProviders from "@/components/layout/ClientProviders";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

import SignupModal from "@/components/auth/SignupModal";
import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

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

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

// ------------------------------
// 🌐 ROOT LAYOUT (SONNER FIXED)
// ------------------------------
export default function RootLayout({ children }: RootLayoutProps) {
  // SignupModal expects `closeAll` prop
  const closeAll = useCallback(() => {}, []);

  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased bg-white text-gray-900 pb-20 md:pb-0">
        {/* ---------- TOP HEADLINE BAR ---------- */}
        <TopbarHeadline />

        {/* ---------- DESKTOP HEADER ---------- */}
        <div className="hidden md:block">
          <DesktopHeader />
        </div>

        {/* ---------- MOBILE HEADER ---------- */}
        <div className="md:hidden">
          <MobileHeader />
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <main className="flex flex-col min-h-screen bg-white">
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
        <SignupModal closeAll={closeAll} />

        {/* ---------- LOGOUT CONFIRM MODAL (GLOBAL) ---------- */}
        <LogoutConfirmModal />

        {/* ---------- 🔔 SONNER TOASTER (REQUIRED) ---------- */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          duration={2000}
        />
      </body>
    </html>
  );
}
