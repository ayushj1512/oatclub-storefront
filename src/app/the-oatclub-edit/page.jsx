"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Gift, LineChart, Sparkles } from "lucide-react";

const PROGRAM_NAME = "OATCLUB EDIT";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const perks = [
  ["GIFTED EDITS", "Selected OATCLUB pieces for creators with a clean fashion point of view.", Gift],
  ["EDIT CODE", "Personal code and performance-led collaboration opportunities.", LineChart],
  ["EARLY ACCESS", "Preview drops, stories and styling briefs before public release.", Sparkles],
];

const steps = [
  ["01", "APPLY", "Share your profile, city, niche and active social links."],
  ["02", "CURATE", "We review your content quality, audience fit and OATCLUB alignment."],
  ["03", "CREATE", "Selected creators receive edit briefs, pieces and next collaboration steps."],
];

const fit = [
  "Fashion, styling, lifestyle and outfit creators",
  "Micro creators with consistent content and real engagement",
  "Creators who shoot reels, GRWM videos and styling edits",
  "Profiles with a clean visual identity and audience trust",
];

function Label({ children }) {
  return (
    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-black/45">
      {children}
    </p>
  );
}

export default function TheFitCheckEditPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-black/10 px-3 py-8 md:px-8 lg:px-10 lg:py-12">
        <div className="flex min-h-[calc(100vh-96px)] flex-col justify-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Label>{PROGRAM_NAME}</Label>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-3 max-w-4xl text-[34px] font-black uppercase leading-[0.98] md:text-[56px] lg:text-[72px]"
          >
            A creator edit for style that actually moves.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-4 max-w-2xl text-[12px] font-bold uppercase leading-6 tracking-[0.07em] text-black/58 md:text-sm"
          >
            OATCLUB EDIT is our collaboration program for creators who turn personal style
            into clean outfit content, reels and sharp fashion storytelling.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-6 grid gap-2 sm:grid-cols-[180px_180px]"
          >
            <Link
              href="/the-oatclub-edit/apply"
              className="flex h-11 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.18em] text-white"
            >
              APPLY NOW
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex h-11 items-center justify-center gap-2 border border-black text-[10px] font-black uppercase tracking-[0.18em] text-black"
            >
              HOW IT WORKS
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-6 grid grid-cols-3 border-y border-black/10"
          >
            {["GIFTING", "AFFILIATE", "EARLY DROPS"].map((item) => (
              <div key={item} className="border-r border-black/10 px-2 py-3 last:border-r-0">
                <p className="text-center text-[9px] font-black uppercase tracking-[0.14em] text-black/50">
                  {item}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-6 max-w-md border border-black/10 bg-[#fbfbfb] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/45">
                  EDIT BRIEF
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.08em]">
                  STYLE IT. SHOOT IT. OWN THE EDIT.
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/45">
                Creator program
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-3 py-8 md:px-8 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-3">
          <div>
            <Label>WHY JOIN</Label>
            <h2 className="mt-1 text-2xl font-black uppercase md:text-3xl">EDIT PERKS</h2>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {perks.map(([title, desc, Icon]) => (
            <div key={title} className="border border-black/10 bg-white p-4">
              <Icon className="h-5 w-5 text-black" />
              <h3 className="mt-4 text-sm font-black uppercase tracking-[0.12em]">{title}</h3>
              <p className="mt-2 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/55">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-black/10 bg-[#fbfbfb] px-3 py-8 md:px-8 md:py-10">
        <Label>PROCESS</Label>
        <h2 className="mt-1 text-2xl font-black uppercase md:text-3xl">THREE CLEAR STEPS</h2>

        <div className="mt-5 grid gap-2 md:grid-cols-3">
          {steps.map(([number, title, desc]) => (
            <div key={number} className="border border-black/10 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/35">{number}</p>
              <h3 className="mt-4 text-base font-black uppercase">{title}</h3>
              <p className="mt-2 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/55">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 px-3 py-8 md:px-8 md:py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Label>WHO CAN APPLY</Label>
          <h2 className="mt-1 text-2xl font-black uppercase md:text-3xl">
            BUILT FOR STYLE-LED CREATORS.
          </h2>
          <p className="mt-3 text-[12px] font-bold uppercase leading-6 tracking-[0.06em] text-black/55">
            We look for creators with consistency, visual taste, audience trust and a point of
            view that feels natural inside the OATCLUB edit.
          </p>
        </div>

        <div className="grid gap-2">
          {fit.map((item) => (
            <div key={item} className="flex gap-3 border border-black/10 bg-white p-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-[11px] font-black uppercase leading-5 tracking-[0.06em] text-black/62">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-3 pb-10 md:px-8">
        <div className="bg-black p-5 text-white md:p-8">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/45">
            READY?
          </p>
          <h2 className="mt-2 max-w-3xl text-2xl font-black uppercase leading-tight md:text-4xl">
            Apply to {PROGRAM_NAME} and bring your point of view to the club.
          </h2>
          <Link
            href="/the-oatclub-edit/apply"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 bg-white px-5 text-[10px] font-black uppercase tracking-[0.18em] text-black"
          >
            START APPLICATION
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
