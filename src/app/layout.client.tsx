// src/app/layout.client.tsx
"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useEffect, useCallback } from "react";

import TopbarHeadline from "@/components/layout/TopbarHeadline";
import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ClientProviders from "@/components/layout/ClientProviders";

import SignupModal from "@/components/auth/SignupModal";
import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

import { useAuthStore } from "@/store/authStore";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";

/* ---------------------------------
   🔥 Initialize Auth Store
---------------------------------- */
function AuthInit() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const closeAll = useCallback(() => {}, []);

  return (
    <>
      {/* TRACKING */}
      <GoogleTagManager gtmId="GTM-5CTM95TR" />

      {/* TOP BAR */}
      <TopbarHeadline />

      {/* HEADER */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* MAIN */}
      <main className="flex min-h-screen flex-col bg-white pb-20 md:pb-0">
        {children}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* PROVIDERS */}
      <ClientProviders>
        <AuthInit />
        <ScrollToTop />
      </ClientProviders>

      {/* MODALS */}
      <SignupModal closeAll={closeAll} />
      <LogoutConfirmModal />

      {/* TOASTER */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        duration={2000}
      />
    </>
  );
}
