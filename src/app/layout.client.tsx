"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useEffect, Suspense } from "react";

import GTMPageView from "@/components/tracking/GTMPageView";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";
import MetaPixel from "@/components/tracking/MetaPixel"; // ✅ ADD THIS
import ClarityProvider from "@/components/clarity/ClarityProvider";

import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ClientProviders from "@/components/layout/ClientProviders";

import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

import { useAuthStore } from "@/store/authStore";

/* ---------------------------------
   🔥 Initialize Auth Store (EARLY)
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
  // ✅ Use ENV variable (recommended)
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

  return (
    <>
      {/* ✅ AUTH INIT FIRST (IMPORTANT) */}
      <AuthInit />

      {/* ✅ TRACKING (Wrapped in Suspense to avoid build error) */}
      <Suspense fallback={null}>
        {/* ✅ META PIXEL */}
        <MetaPixel pixelId={META_PIXEL_ID} trackPageView debug />

        {/* ✅ GTM */}
        <GoogleTagManager gtmId="GTM-5CTM95TR" />
        <GTMPageView />

        {/* ✅ MICROSOFT CLARITY */}
        <ClarityProvider />
      </Suspense>

      {/* ✅ PROVIDERS SHOULD WRAP EVERYTHING */}
      <ClientProviders>
        {/* HEADER */}
        <div className="hidden md:block">
          <DesktopHeader />
        </div>
        <div className="md:hidden">
          <MobileHeader />
        </div>

        {/* MAIN */}
        <main className="flex min-h-screen flex-col bg-white md:pb-0">
          {children}
        </main>

        {/* FOOTER */}
        <Footer />

        {/* Utilities */}
        <ScrollToTop />

        {/* MODALS */}
        <LogoutConfirmModal />

        {/* TOASTER */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          duration={2000}
        />
      </ClientProviders>
    </>
  );
}
