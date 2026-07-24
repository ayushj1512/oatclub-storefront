"use client";

import "./globals.css";

import { Suspense, useEffect } from "react";
import { Toaster } from "sonner";

import GTMPageView from "@/components/tracking/GTMPageView";
import MetaPixel from "@/components/tracking/MetaPixel";
import SnapPixel from "@/components/tracking/SnapPixel";
import ClarityProvider from "@/components/clarity/ClarityProvider";

import MetaParameterInitializer from "@/components/analytics/MetaParameterInitializer";

import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import DynamicTabTitle from "@/components/layout/DynamicTabTitle";
import ClientProviders from "@/components/layout/ClientProviders";

import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

import { useAuthStore } from "@/store/authStore";
import { useCustomerCartStore } from "@/store/customerCartStore";
import { useMarketingCampaignStore } from "@/store/marketing-campaignStore";

/* =========================================================
   AUTH INITIALIZATION
========================================================= */

function AuthInit() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const customerId = useAuthStore((s) => s.customer?._id);

  const initializeCustomerCart = useCustomerCartStore(
    (s) => s.initialize
  );

  const mergeGuestCartAdds = useCustomerCartStore(
    (s) => s.mergeGuestCartAdds
  );

  useEffect(() => {
    initializeAuth?.();
  }, [initializeAuth]);

  useEffect(() => {
    initializeCustomerCart?.();
  }, [initializeCustomerCart]);

  useEffect(() => {
    if (!customerId) return;
    mergeGuestCartAdds?.();
  }, [customerId, mergeGuestCartAdds]);

  return null;
}

/* =========================================================
   MARKETING CAMPAIGN INITIALIZATION
========================================================= */

function MarketingCampaignInit() {
  const captureFromUrl = useMarketingCampaignStore(
    (s) => s.captureFromUrl
  );

  useEffect(() => {
    captureFromUrl?.();
  }, [captureFromUrl]);

  return null;
}

/* =========================================================
   ROOT CLIENT LAYOUT
========================================================= */

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const META_PIXEL_ID =
    process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

  const SNAP_PIXEL_ID =
    process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || "";

  return (
    <>
      {/* =====================================================
          Meta Parameter Builder
          Runs first to capture fbclid → _fbc
      ====================================================== */}
      <MetaParameterInitializer />

      <AuthInit />
      <MarketingCampaignInit />
      <DynamicTabTitle />

      <Suspense fallback={null}>
        <MetaPixel
          pixelId={META_PIXEL_ID}
          trackPageView
          debug={process.env.NODE_ENV === "development"}
        />

        <SnapPixel
          pixelId={SNAP_PIXEL_ID}
          trackPageView
          debug={process.env.NODE_ENV === "development"}
        />

        <GTMPageView />

        <ClarityProvider />
      </Suspense>

      <ClientProviders>
        <div className="hidden md:block">
          <DesktopHeader />
        </div>

        <div className="md:hidden">
          <MobileHeader />
        </div>

        <main className="flex min-h-screen flex-col bg-white pb-8">
          {children}
        </main>

        <Footer />

        <ScrollToTop />

        <LogoutConfirmModal />

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={1000}
          toastOptions={{
            classNames: {
              toast:
                "text-[12px] leading-4 px-3 py-2 min-h-[36px] rounded-lg shadow-sm",

              description:
                "text-[11px] leading-4 opacity-80",

              actionButton: "h-7 px-2 text-[11px]",

              cancelButton: "h-7 px-2 text-[11px]",
            },
          }}
        />
      </ClientProviders>
    </>
  );
}
