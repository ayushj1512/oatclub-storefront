"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useEffect, Suspense } from "react";

import GTMPageView from "@/components/tracking/GTMPageView";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";
import MetaPixel from "@/components/tracking/MetaPixel";
import ClarityProvider from "@/components/clarity/ClarityProvider";

import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ClientProviders from "@/components/layout/ClientProviders";
import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";

import { useAuthStore } from "@/store/authStore";
import { useCustomerCartStore } from "@/store/customerCartStore";

/* -----------------------------
   ✅ Snaptr (Snapchat Pixel) types
   - no `any`
   - no `arguments`
   - no `.apply`
------------------------------ */
type SnaptrArgs = unknown[];

type SnaptrFn = ((...args: SnaptrArgs) => void) & {
  queue?: SnaptrArgs[];
  handleRequest?: (...args: SnaptrArgs) => void;
};

declare global {
  interface Window {
    snaptr?: SnaptrFn;
  }
}

/* -----------------------------
   🔥 Init auth + customer cart
------------------------------ */
function AuthInit() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const customerId = useAuthStore((s) => s.customer?._id);

  const initializeCustomerCart = useCustomerCartStore((s) => s.initialize);
  const mergeGuestCartAdds = useCustomerCartStore((s) => s.mergeGuestCartAdds);

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

/* -----------------------------
   👻 Snapchat Pixel (Snaptr)
   Fixes:
   ✅ no-explicit-any
   ✅ no-unused-expressions
   ✅ prefer-rest-params
   ✅ prefer-spread
   ✅ TS: handleRequest/queue typing
------------------------------ */
function SnapPixel() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.snaptr) return; // already present

    // Create the stub function first (typed)
    const stub: SnaptrFn = (...args: SnaptrArgs) => {
      if (stub.handleRequest) stub.handleRequest(...args);
      else (stub.queue ??= []).push(args);
    };
    stub.queue = [];
    window.snaptr = stub;

    // Inject Snap script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://sc-static.net/scevent.min.js";
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
    else document.head.appendChild(script);

    // Init + track page view
    window.snaptr("init", "b91dd232-d18e-4555-9224-ea52d736d290");
    window.snaptr("track", "PAGE_VIEW");
  }, []);

  return null;
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

  return (
    <>
      <AuthInit />

      <Suspense fallback={null}>
        {/* ✅ Tracking (client only) */}
        <MetaPixel pixelId={META_PIXEL_ID} trackPageView debug />
        <GoogleTagManager gtmId="GTM-5CTM95TR" />
        <GTMPageView />
        <ClarityProvider />
        <SnapPixel />
      </Suspense>

      <ClientProviders>
        <div className="hidden md:block"><DesktopHeader /></div>
        <div className="md:hidden"><MobileHeader /></div>

        {/* ✅ all classnames in one line (hydration-safe) */}
        <main className="flex min-h-screen flex-col bg-white pb-8">{children}</main>

        <Footer />
        <ScrollToTop />
        <LogoutConfirmModal />

        <Toaster position="top-right" richColors closeButton expand={false} duration={1000} toastOptions={{ classNames: { toast: "text-[12px] leading-4 px-3 py-2 min-h-[36px] rounded-lg shadow-sm", description: "text-[11px] leading-4 opacity-80", actionButton: "h-7 px-2 text-[11px]", cancelButton: "h-7 px-2 text-[11px]" } }} />
      </ClientProviders>
    </>
  );
}
