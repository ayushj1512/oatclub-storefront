"use client";

import Link from "next/link";
import { Crown, HeartHandshake, Sparkles, ShieldCheck, Users, Gem, ArrowRight, BadgeCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="w-full bg-[#f5f5f5] text-gray-900">
  <section className="w-full px-4 md:px-12 py-12 md:py-16">
    <div className="max-w-7xl mx-auto flex flex-col gap-10">

      {/* ================= HEADER ================= */}
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gray-500">
          OATCLUB
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
          About Us
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed">
          A customer-first fashion brand inspired by confidence, elegance, and everyday wearability.
        </p>
      </div>

      {/* ================= HERO ================= */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 rounded-3xl border border-gray-200 bg-white p-6 md:p-10">

        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold tracking-widest uppercase">
            Premium • Empowered • Customer-first
          </span>

          <h2 className="mt-6 text-2xl md:text-4xl font-extrabold leading-tight">
            OATCLUB is inspired by a Turkish word that reflects
            <span className="block text-black">strength & empowerment.</span>
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed max-w-xl">
            That meaning defines everything we do — from curated styles to honest quality
            and a shopping experience designed entirely around you.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-7 py-3 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Contact Support <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-6">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gray-500">
            What You Can Expect
          </p>

          <div className="mt-5 space-y-5">
            {[
              {
                title: "Premium Picks",
                desc: "Curated styles with a refined, elevated finish.",
                icon: <BadgeCheck className="w-5 h-5" />,
              },
              {
                title: "Trust & Transparency",
                desc: "Clear policies and reliable customer support.",
                icon: <ShieldCheck className="w-5 h-5" />,
              },
              {
                title: "Customer First",
                desc: "Every decision made with customer comfort in mind.",
                icon: <HeartHandshake className="w-5 h-5" />,
              },
            ].map((i) => (
              <div key={i.title} className="flex gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  {i.icon}
                </span>
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-sm text-gray-600">{i.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MISSION + VISION ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            tag: "Our Mission",
            title: "Fashion that empowers. Service that cares.",
            desc:
              "To build a customer-centric fashion brand that delivers confidence, comfort, and premium quality — without unnecessary complexity.",
            icon: <HeartHandshake className="w-5 h-5" />,
          },
          {
            tag: "Our Vision",
            title: "Made for everyone, everywhere.",
            desc:
              "To create an inclusive fashion destination where women of all backgrounds find styles that reflect their individuality.",
            icon: <Users className="w-5 h-5" />,
          },
        ].map((b) => (
          <div
            key={b.tag}
            className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              {b.icon}
            </span>

            <p className="mt-4 text-xs font-semibold tracking-widest uppercase text-gray-500">
              {b.tag}
            </p>
            <h3 className="mt-2 text-xl md:text-2xl font-extrabold">
              {b.title}
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* ================= VALUES ================= */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-extrabold">
          What We Stand For
        </h2>
        <p className="mt-2 text-gray-600">
          The principles shaping our brand and community.
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Empowerment",
              icon: <Crown className="w-5 h-5" />,
            },
            {
              title: "Customer First",
              icon: <ShieldCheck className="w-5 h-5" />,
            },
            {
              title: "Everyday Premium",
              icon: <Gem className="w-5 h-5" />,
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-gray-200 bg-[#fafafa] p-5 hover:bg-white transition"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                {v.icon}
              </span>
              <p className="mt-4 font-semibold">{v.title}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Built with detail, intention, and a promise to keep improving — guided by our customers.
      </p>

    </div>
  </section>
</main>

  );
}

