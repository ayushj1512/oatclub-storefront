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

// Load Google Font (Poppins)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

// ------------------------------
// 🔥 INIT AUTH STORE COMPONENT
// ------------------------------
function AuthInit() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

// ------------------------------
// 📌 FIXED → types for children
// ------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

        {/* Main Content */}
        <main className="flex flex-col min-h-screen bg-white">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Scroll + Toast + Auth Providers */}
        <ClientProviders>
          <AuthInit />
          <ScrollToTop />
        </ClientProviders>
      </body>
    </html>
  );
}
