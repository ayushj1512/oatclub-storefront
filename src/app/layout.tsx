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

import SignupModal from "@/components/auth/SignupModal";
import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

// ✅ Tracking Composables
import GoogleTagManager from "@/components/tracking/GoogleTagManager";
import MetaPixel from "@/components/tracking/MetaPixel";

// Google Font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

// ------------------------------
// 🔥 Initialize Auth Store
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
  const closeAll = useCallback(() => {}, []);

  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased bg-white text-gray-900 pb-20 md:pb-0">

        {/* ================= TRACKING (GLOBAL) ================= */}
        <GoogleTagManager gtmId="GTM-5CTM95TR" />
        <MetaPixel pixelId="1216855983666436" />

        {/* ================= TOP BAR ================= */}
        <TopbarHeadline />

        {/* ================= HEADER ================= */}
        <div className="hidden md:block">
          <DesktopHeader />
        </div>

        <div className="md:hidden">
          <MobileHeader />
        </div>

        {/* ================= MAIN ================= */}
        <main className="flex flex-col min-h-screen bg-white">
          {children}
        </main>

        {/* ================= FOOTER ================= */}
        <Footer />

        {/* ================= PROVIDERS ================= */}
        <ClientProviders>
          <AuthInit />
          <ScrollToTop />
        </ClientProviders>

        {/* ================= MODALS ================= */}
        <SignupModal closeAll={closeAll} />
        <LogoutConfirmModal />

        {/* ================= TOASTER ================= */}
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
