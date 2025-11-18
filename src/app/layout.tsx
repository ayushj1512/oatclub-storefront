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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

function AuthInit() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">

        {/* Desktop Header */}
        <div className="hidden md:block">
          <DesktopHeader />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <MobileHeader />
        </div>

        {/* ⭐ FIXED MAIN — allows sticky header ⭐ */}
        <main className="bg-white">
          {children}
        </main>

        <Footer />

        <ClientProviders>
          <AuthInit />
          <ScrollToTop />
        </ClientProviders>

      </body>
    </html>
  );
}
