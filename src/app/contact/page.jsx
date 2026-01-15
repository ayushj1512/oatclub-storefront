"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowUpRight, Copy, Check } from "lucide-react";

// =======================
// CONTACT CONFIG
// =======================
const CONTACT = {
  brand: "Miray Fashion",
  phoneDisplay: "+91 7303491206",
  phoneHref: "tel:+917303491206",
  email: "support@mirayfashions.com",
  emailHref: "mailto:support@mirayfashions.com",
  addressLines: [
    "TA-97-A, Gali No.-2,",
    "Tuglakabad Extension,",
    "New Delhi-110019",
  ],
  fullAddress:
    "TA-97-A, Gali No.-2, Tuglakabad Extension, New Delhi-110019",
  // ✅ Embed (safe + easiest). You can replace q=... with place_id later.
  mapEmbedUrl:
    "https://www.google.com/maps?q=TA-97-A,+Gali+No.-2,+Tuglakabad+Extension,+New+Delhi-110019&output=embed",
  // ✅ Open in maps
  mapOpenUrl:
    "https://www.google.com/maps/search/?api=1&query=TA-97-A,+Gali+No.-2,+Tuglakabad+Extension,+New+Delhi-110019",
};

function useCopy() {
  const [copiedKey, setCopiedKey] = React.useState(null);

  const copy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch (_) {}
  };

  return { copiedKey, copy };
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function ContactPage() {
  const { copiedKey, copy } = useCopy();

  return (
    <main className="w-full bg-white text-black">
      <section className="relative w-full px-4 md:px-10 py-16 overflow-hidden">
        {/* Crazy monochrome background */}
        <div className="pointer-events-none absolute inset-0">
          {/* grid */}
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:56px_56px]" />
          {/* giant soft blobs */}
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-black/10 blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-black/10 blur-3xl" />
          {/* spotlight */}
          <div className="absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl relative">
          {/* ================= HERO ================= */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="relative mb-14 overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 md:p-12"
          >
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-black/60">
                {CONTACT.brand} · Support
              </p>

              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
                Contact Us
              </h1>

              <p className="mt-4 text-base md:text-lg leading-relaxed text-black/70">
                Need help with your order, exchange, return, or delivery? We’re here
                to resolve it fast — with a customer-first approach.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/70">
                  <Clock className="h-4 w-4" />
                  Typical response: within 48 hours
                </span>

                {/* <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/70">
                  <span className="h-2 w-2 rounded-full bg-black/60" />
                  Theme: Black · White · Grey
                </span> */}
              </div>
            </div>

            {/* premium accent */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-black/5 blur-3xl" />
          </motion.div>

          {/* ================= LAYOUT ================= */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
            {/* ================= LEFT: CONTACT CARDS ================= */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.55 }}
              className="space-y-8"
            >
              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:border-black/20">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-widest uppercase text-black/50">
                        Phone
                      </p>
                      <a
                        href={CONTACT.phoneHref}
                        className="mt-2 inline-flex items-center gap-2 text-lg font-extrabold tracking-tight hover:underline"
                      >
                        {CONTACT.phoneDisplay}
                        <ArrowUpRight className="h-4 w-4 opacity-60" />
                      </a>
                      <p className="mt-2 text-sm text-black/60">
                        Call for urgent help (order & delivery)
                      </p>
                    </div>
                    <button
                      onClick={() => copy("phone", CONTACT.phoneDisplay)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:border-black/30 hover:bg-black/5"
                      aria-label="Copy phone"
                    >
                      {copiedKey === "phone" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:border-black/20">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold tracking-widest uppercase text-black/50">
                        Email
                      </p>
                      <a
                        href={CONTACT.emailHref}
                        className="mt-2 inline-flex items-center gap-2 text-lg font-extrabold tracking-tight hover:underline break-all"
                      >
                        {CONTACT.email}
                        <ArrowUpRight className="h-4 w-4 opacity-60" />
                      </a>
                      <p className="mt-2 text-sm text-black/60">
                        Best for tickets, returns & exchanges
                      </p>
                    </div>
                    <button
                      onClick={() => copy("email", CONTACT.email)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:border-black/30 hover:bg-black/5"
                      aria-label="Copy email"
                    >
                      {copiedKey === "email" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:border-black/20">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      {/* <p className="text-xs font-bold tracking-widest uppercase text-black/50">
                        Address
                      </p>
                      <p className="mt-2 text-lg font-extrabold leading-snug">
                        {CONTACT.addressLines.map((l, idx) => (
                          <span key={idx} className="block">
                            {l}
                          </span>
                        ))}
                      </p> */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <a
                          href={CONTACT.mapOpenUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                        >
                          Open in Google Maps
                        </a>
                        <button
                          onClick={() => copy("addr", CONTACT.fullAddress)}
                          className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-black/80 hover:border-black/30 hover:bg-black/5 transition"
                        >
                          {copiedKey === "addr" ? "Copied" : "Copy Address"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crazy-looking monochrome strip */}
              <div className="relative overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 md:p-10 shadow-sm">
                <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="relative">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Want the fastest resolution?
                  </h2>
                  <p className="mt-2 text-sm md:text-base leading-relaxed text-black/70 max-w-2xl">
                    For exchange/return and pickup issues, please include your Order ID,
                    registered phone number, and clear product images (with tags) in your
                    message.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/faq"
                      className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      Read FAQs
                    </Link>
                    <Link
                      href="/exchange-and-return"
                      className="inline-flex items-center justify-center rounded-full border border-black/20 px-7 py-3 text-sm font-semibold text-black/80 hover:border-black/30 hover:bg-black/5 transition"
                    >
                      Exchange & Return Policy
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <p className="text-xs leading-relaxed text-black/50">
                By contacting {CONTACT.brand}, you agree that our team may reach out via
                phone, email, or WhatsApp for order resolution.
              </p>
            </motion.div>

            {/* ================= RIGHT: MAP + INFO ================= */}
            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
              className="space-y-6 lg:sticky lg:top-24 h-fit"
            >
              {/* Map Card */}
              <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-black/50">
                    Store Location
                  </h3>
                  <p className="mt-2 text-sm text-black/70">
                    Find us on Google Maps — tap to navigate.
                  </p>
                </div>
                <div className="relative aspect-[4/3] w-full bg-black/5">
                  <iframe
                    title="Miray Fashion Location"
                    src={CONTACT.mapEmbedUrl}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Support Info */}
              <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-black/50">
                  Support Checklist
                </h3>
                <ul className="space-y-3 text-sm text-black/75">
                  <li>
                    <span className="font-semibold">Order ID</span> + registered phone
                  </li>
                  <li>
                    <span className="font-semibold">Issue type:</span> exchange / return /
                    pickup
                  </li>
                  <li>
                    <span className="font-semibold">Images:</span> clear product + tags
                  </li>
                  <li>
                    <span className="font-semibold">Timeline:</span> delivery date & request
                    date
                  </li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-black/50">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    href={CONTACT.phoneHref}
                    className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    Call Support
                  </a>
                  <a
                    href={CONTACT.emailHref}
                    className="inline-flex items-center justify-center rounded-full border border-black/20 px-6 py-3 text-sm font-semibold text-black/80 hover:border-black/30 hover:bg-black/5 transition"
                  >
                    Email Support
                  </a>
                  <a
                    href={CONTACT.mapOpenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-black/20 px-6 py-3 text-sm font-semibold text-black/80 hover:border-black/30 hover:bg-black/5 transition"
                  >
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Mono CTA */}
              <div className="rounded-3xl bg-black p-8 text-white shadow-sm">
                <h3 className="text-xl font-extrabold tracking-tight">
                  We’re here to help.
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  For faster service, try the FAQs first — most issues resolve instantly.
                </p>
                <div className="mt-6">
                  <Link
                    href="/faq"
                    className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
                  >
                    Visit FAQs
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </main>
  );
}
