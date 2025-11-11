import "./globals.css";
import { Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miray Fashions | Luxury Made Accessible",
  description:
    "Explore Miray Fashions – luxury clothing made accessible. Discover timeless Indian designs crafted with love and sustainability.",
};

// ✅ Load Google Font (Poppins)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface RootLayoutProps {
  children: React.ReactNode; // ✅ Explicitly typed children
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased bg-white text-gray-900`}
      >
        {/* Global Header */}
        <Header />

        {/* Main Page Content */}
        <main className="flex flex-col min-h-screen">{children}</main>

        {/* Global Footer */}
        <Footer />

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </body>
    </html>
  );
}
