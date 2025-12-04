"use client";

import Link from "next/link";
import { Crown, HeartHandshake, Sparkles, ShieldCheck, Users, Gem, ArrowRight, BadgeCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="w-full bg-[#fafafa] text-gray-900">
      <section className="w-full px-4 md:px-10 py-10 md:py-14">
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs font-semibold text-[#800020] tracking-[0.22em] uppercase">Miray Fashions</p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">About Us</h1>
            <p className="text-sm md:text-base text-gray-600">A customer-first fashion brand inspired by empowerment, elegance, and everyday confidence.</p>
          </div>

          {/* Hero (white only) */}
          <div className="w-full flex flex-col lg:flex-row gap-6 rounded-3xl border border-gray-200 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)] p-6 md:p-10">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-black/5">
                <Sparkles className="w-4 h-4 text-[#800020]" />
                <span className="text-[11px] md:text-xs font-semibold tracking-[0.22em] uppercase text-gray-900">Empowerment • Premium • Customer-first</span>
              </div>

              <h2 className="mt-4 text-xl md:text-3xl font-extrabold leading-tight text-gray-900">
                Miray is inspired by a Turkish word associated with the <span className="text-[#800020]">empowerment of women</span>.
              </h2>

              <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed">
                That meaning shapes our brand: curated styles, honest quality, and a smooth experience built around you. We want every customer to feel confident—whether it’s a daily essential or a special occasion pick.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/categories" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#800020] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/support" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50 transition">
                  Contact Support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-[380px] flex-none min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold text-gray-500 tracking-[0.22em] uppercase">What you can expect</p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#800020]/10 text-[#800020] ring-1 ring-black/5">
                    <BadgeCheck className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">Premium Picks</p>
                    <p className="text-sm text-gray-600">Curated styles that feel elevated and confident.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-black ring-1 ring-black/5">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">Trust & Transparency</p>
                    <p className="text-sm text-gray-600">Clear policies and support that helps.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#800020]/10 text-[#800020] ring-1 ring-black/5">
                    <HeartHandshake className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">Customer-First</p>
                    <p className="text-sm text-gray-600">Built around your comfort and feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission + Vision */}
          <div className="w-full flex flex-col lg:flex-row gap-6 mt-8">
            <div className="flex-1 rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#800020]/10 text-[#800020] ring-1 ring-black/5">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#800020] tracking-[0.22em] uppercase">Our Mission</p>
                  <h2 className="text-xl md:text-2xl font-extrabold mt-1">Fashion that empowers, service that cares.</h2>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-700 mt-4 leading-relaxed">
                Our mission is to build a <span className="font-semibold">customer-centric fashion brand</span> that empowers women through styles that feel confident, comfortable, and premium—without the hassle. We focus on reliable quality, thoughtful pricing, and a smooth shopping journey so every customer feels valued, heard, and supported.
              </p>
              <ul className="mt-4 space-y-2 text-sm md:text-base text-gray-700 list-disc pl-5">
                <li>Curated collections for modern Indian fashion—sarees, kurtis, ethnic wear & more.</li>
                <li>Quality-first approach with a premium feel.</li>
                <li>Support that actually helps—fast resolutions and transparent policies.</li>
              </ul>
            </div>

            <div className="flex-1 rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5 text-black ring-1 ring-black/5">
                  <Users className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#800020] tracking-[0.22em] uppercase">Our Vision</p>
                  <h2 className="text-xl md:text-2xl font-extrabold mt-1">Make Miray for everyone, everywhere.</h2>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-700 mt-4 leading-relaxed">
                Our vision is to grow Miray into a brand that’s <span className="font-semibold">accessible to all</span>—a place where women from every background can find styles that match their vibe and lifestyle. We aim to build a community rooted in confidence and trust, where fashion becomes a tool for self-expression and empowerment.
              </p>
              <ul className="mt-4 space-y-2 text-sm md:text-base text-gray-700 list-disc pl-5">
                <li>Inclusive styles for different occasions, ages, and aesthetics.</li>
                <li>Consistent quality and a shopping experience customers love returning to.</li>
                <li>A brand that grows responsibly by listening closely to customers.</li>
              </ul>
            </div>
          </div>

          {/* Values */}
          <div className="mt-8 rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#800020] tracking-[0.22em] uppercase">Values</p>
                <h2 className="text-xl md:text-2xl font-extrabold mt-1">What We Stand For</h2>
                <p className="text-sm md:text-base text-gray-600 mt-2">The pillars that shape our products, service, and community.</p>
              </div>
              <Link href="/faq" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#800020] hover:opacity-80 transition">
                Read FAQs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="w-full flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 rounded-3xl border border-gray-200 bg-[#fafafa] p-5 hover:bg-white transition">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#800020]/10 text-[#800020] ring-1 ring-black/5">
                    <Crown className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">Empowerment</p>
                    <p className="text-sm text-gray-700 mt-1">Styles that help you feel strong, confident, and completely yourself.</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 rounded-3xl border border-gray-200 bg-[#fafafa] p-5 hover:bg-white transition">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-black ring-1 ring-black/5">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">Customer First</p>
                    <p className="text-sm text-gray-700 mt-1">Clear communication, helpful support, and transparent policies.</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 rounded-3xl border border-gray-200 bg-[#fafafa] p-5 hover:bg-white transition">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#800020]/10 text-[#800020] ring-1 ring-black/5">
                    <Gem className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">Everyday Premium</p>
                    <p className="text-sm text-gray-700 mt-1">Premium feel, polished looks—made for daily wear and special moments.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-gray-200 p-5 bg-[#fafafa]">
              <p className="text-sm text-gray-700">Want to talk to us? For queries, order help, or collaborations — reach our support team anytime.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/support" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#800020] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
                  Support <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/categories" className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition">
                  Explore Collections <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-8">Miray Fashions is built with love, detail, and a promise: to keep improving—based on what our customers truly want.</p>
        </div>
      </section>
    </main>
  );
}
