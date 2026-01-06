"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { SOCIAL_LINKS } from "@/data/socials";

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (section) =>
    setOpenSection((p) => (p === section ? null : section));
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="w-full bg-black text-white mt-16">
      {/* ================= MAIN ================= */}
      <div className="mx-auto  px-6 md:px-12 py-12">
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:grid grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Image
                src="https://res.cloudinary.com/djtva6hec/image/upload/v1767117853/miray/media/prjk693rucvgygdzkzx4.png"
                alt="Miray"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </div>

            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              Redefining fashion with elegance and modern style. Curated
              collections designed to inspire confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-white/80">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <Link href="/categories" className="hover:text-white transition">
                Shop
              </Link>
              <Link href="/about" className="hover:text-white transition">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-white/80">
              Support
            </h3>
            <nav className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="/support" className="hover:text-white transition">
                Support
              </Link>
              <Link href="/faq" className="hover:text-white transition">
                FAQs
              </Link>
              <Link
                href="/shipping-policy"
                className="hover:text-white transition"
              >
                Shipping Policy
              </Link>
              <Link
                href="/exchange-and-return"
                className="hover:text-white transition"
              >
                Exchange & Return
              </Link>
              <Link
                href="/cancellation-and-refund"
                className="hover:text-white transition"
              >
                Cancellation & Refund
              </Link>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="hover:text-white transition"
              >
                Terms & Conditions
              </Link>
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-white/80">
              Follow Us
            </h3>
            <div className="flex gap-4 text-white/60">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition"
              >
                <Instagram />
              </a>

              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition"
              >
                <Facebook />
              </a>

              <a
                href={SOCIAL_LINKS.whatsapp.link}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="hover:text-white transition"
              >
                <MessageCircle />
              </a>

              <a
                href={SOCIAL_LINKS.email}
                aria-label="Email"
                className="hover:text-white transition"
              >
                <Mail />
              </a>
            </div>
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden max-w-md mx-auto space-y-6">
          {/* Brand */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <Image
                src="https://res.cloudinary.com/djtva6hec/image/upload/v1767117853/miray/media/prjk693rucvgygdzkzx4.png"
                alt="Miray"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </div>

            <p className="text-sm text-white/60 leading-relaxed">
              Redefining fashion with elegance and modern style.
            </p>
          </div>

          {/* Accordions */}
          <div className="divide-y divide-white/10 border-y border-white/10">
            {/* Quick Links */}
            <div>
              <button
                onClick={() => toggleSection("quick")}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold"
              >
                Quick Links
                {openSection === "quick" ? <ChevronUp /> : <ChevronDown />}
              </button>

              {openSection === "quick" && (
                <div className="pb-3 pl-2 flex flex-col gap-2 text-sm text-white/60">
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                  <Link href="/categories" className="hover:text-white">
                    Shop
                  </Link>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </div>
              )}
            </div>

            {/* Support */}
            <div>
              <button
                onClick={() => toggleSection("support")}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold"
              >
                Support
                {openSection === "support" ? <ChevronUp /> : <ChevronDown />}
              </button>

              {openSection === "support" && (
                <div className="pb-3 pl-2 flex flex-col gap-2 text-sm text-white/60">
                  <Link href="/support" className="hover:text-white">
                    Support
                  </Link>
                  <Link href="/faq" className="hover:text-white">
                    FAQs
                  </Link>
                  <Link href="/shipping-policy" className="hover:text-white">
                    Shipping Policy
                  </Link>
                  <Link href="/exchange-and-return" className="hover:text-white">
                    Exchange & Return
                  </Link>
                  <Link
                    href="/cancellation-and-refund"
                    className="hover:text-white"
                  >
                    Cancellation & Refund
                  </Link>
                  <Link href="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                  <Link href="/terms-and-conditions" className="hover:text-white">
                    Terms & Conditions
                  </Link>
                </div>
              )}
            </div>

            {/* Social */}
            <div>
              <button
                onClick={() => toggleSection("social")}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold"
              >
                Follow Us
                {openSection === "social" ? <ChevronUp /> : <ChevronDown />}
              </button>

              {openSection === "social" && (
                <div className="pb-4 pl-2 flex gap-4 text-white/60">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="hover:text-white"
                  >
                    <Instagram />
                  </a>

                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="hover:text-white"
                  >
                    <Facebook />
                  </a>

                  <a
                    href={SOCIAL_LINKS.whatsapp.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="hover:text-white"
                  >
                    <MessageCircle />
                  </a>

                  <a
                    href={SOCIAL_LINKS.email}
                    aria-label="Email"
                    className="hover:text-white"
                  >
                    <Mail />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        © {year} Miray Fashions. All rights reserved.
      </div>
    </footer>
  );
}
