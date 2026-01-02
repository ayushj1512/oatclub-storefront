// src/app/layout.client.tsx
"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useEffect, useCallback, Suspense } from "react";

import GTMPageView from "@/components/tracking/GTMPageView";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";

// ✅ ADD THIS (Clarity Provider)
import ClarityProvider from "@/components/clarity/ClarityProvider";

import TopbarHeadline from "@/components/layout/TopbarHeadline";
import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ClientProviders from "@/components/layout/ClientProviders";

import SignupModal from "@/components/auth/SignupModal";
import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

import { useAuthStore } from "@/store/authStore";

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
      {/* ✅ TRACKING (Wrapped in Suspense to avoid build error) */}
      <Suspense fallback={null}>
        <GoogleTagManager gtmId="GTM-5CTM95TR" />
        <GTMPageView />

        {/* ✅ MICROSOFT CLARITY INIT (Loads once globally) */}
        <ClarityProvider />
      </Suspense>


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
