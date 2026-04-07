"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Gift,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  Star,
  Play,
} from "lucide-react";

/* =========================
   ANIMATIONS
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const cardIn = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* =========================
   DATA
========================= */
const perks = [
  {
    icon: Gift,
    title: "Gifted Collaborations",
    desc: "Get access to selected styles and create authentic fit-check content with Miray.",
  },
  {
    icon: BadgePercent,
    title: "Affiliate Benefits",
    desc: "Unlock a personal creator code and performance-based collaboration opportunities.",
  },
  {
    icon: Sparkles,
    title: "Early Access",
    desc: "Preview special drops, edits, and creator-first opportunities before everyone else.",
  },
];

const steps = [
  {
    number: "01",
    title: "Apply",
    desc: "Fill out a quick creator form with your details, socials, and content style.",
  },
  {
    number: "02",
    title: "Get Reviewed",
    desc: "Our team reviews your aesthetic, audience quality, and overall collaboration fit.",
  },
  {
    number: "03",
    title: "Start Your Edit",
    desc: "If selected, we’ll share the next steps, collab details, and creator opportunities.",
  },
];

const fitFor = [
  "Fashion, lifestyle, and styling creators",
  "Micro influencers and growing creators",
  "Creators who enjoy reels, outfit content, and fit checks",
  "Profiles with a strong aesthetic and engaged audience",
];

const chips = [
  "Creator-first",
  "Style-led",
  "Minimal & premium",
  "Content-focused",
];

/* =========================
   SMALL UI PARTS
========================= */
function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60 shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-[#800020]/70" />
      {children}
    </div>
  );
}

function SoftGlow({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full blur-3xl ${className}`}
    />
  );
}

/* =========================
   HERO
========================= */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 pb-10 pt-4 sm:px-6">
      <SoftGlow className="left-[-80px] top-[-80px] h-52 w-52 bg-black/[0.04]" />
      <SoftGlow className="bottom-[-60px] right-[-60px] h-56 w-56 bg-[#800020]/[0.05]" />

      <div className="relative">
        <div className="grid min-h-[92vh] items-center gap-8 py-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="order-2 lg:order-1">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <SectionLabel>The FitCheck Edit</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="mt-4 max-w-3xl text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.06em] text-black sm:text-[3.4rem] lg:text-[4.8rem]"
            >
              A creator program
              <span className="block text-black/78">
                built for style, content,
              </span>
              <span className="block">and real influence.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-5 max-w-xl text-sm leading-6 text-black/62 sm:text-[15px]"
            >
              <span className="font-semibold text-black">The FitCheck Edit</span>{" "}
              is Miray’s influencer collaboration program for creators who love
              styling, outfit storytelling, reels, and premium fashion content.
              From gifted edits to affiliate perks, this is where great fits meet
              meaningful collaborations.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/the-FitCheck-Edit/apply"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-[#f7f7f7] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f1f1f1]"
              >
                How it works
                <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-7 flex flex-wrap gap-2"
            >
              {chips.map((chip) => (
                <div
                  key={chip}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-[12px] font-medium text-black/70"
                >
                  {chip}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="rounded-[2rem] border border-black/10 bg-[#f7f7f7] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-4">
                <div className="overflow-hidden rounded-[1.7rem] border border-black/8 bg-white">
                  <div className="border-b border-black/8 bg-[#fafafa] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                          Miray Creator Program
                        </p>
                        <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-black">
                          The FitCheck Edit
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#ffffff_0%,#f4f4f4_100%)] p-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-1 text-[11px] font-medium text-black/65">
                        <Star className="h-3.5 w-3.5 text-[#800020]/70" />
                        Curated creator collaboration
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em] text-black">
                        Style it.
                        <br />
                        Shoot it.
                        <br />
                        Share your edit.
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-black/58">
                        Premium styles, thoughtful collaborations, and creator-led
                        visibility with Miray.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[1.3rem] border border-black/8 bg-[#fafafa] p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                          Perks
                        </p>
                        <p className="mt-2 text-sm font-semibold text-black">
                          Gifting + affiliate
                        </p>
                      </div>

                      <div className="rounded-[1.3rem] border border-black/8 bg-[#fafafa] p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                          Content
                        </p>
                        <p className="mt-2 text-sm font-semibold text-black">
                          Reels, edits, fit checks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.25 }}
                className="absolute -left-1 bottom-10 rounded-2xl border border-black/8 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
              >
                <p className="text-xs font-semibold text-black">Gifted edits</p>
                <p className="mt-1 text-[11px] text-black/55">
                  Selected styles from curated drops
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.35 }}
                className="absolute -right-1 top-10 rounded-2xl border border-black/8 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
              >
                <p className="text-xs font-semibold text-black">Creator code</p>
                <p className="mt-1 text-[11px] text-black/55">
                  Trackable rewards and collaborations
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   PERKS
========================= */
function PerksSection() {
  return (
    <section className="bg-[#fafafa] px-4 py-10 sm:px-6 sm:py-12">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mb-6"
      >
        <SectionLabel>Why join</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          More than just a collab.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
          The FitCheck Edit is built for creators who care about clean content,
          personal style, and authentic partnerships.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perks.map((item, i) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              variants={cardIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              whileHover={{ y: -4 }}
              className="rounded-[1.8rem] border border-black/10 bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04] text-black">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-black">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/60">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================
   HOW IT WORKS
========================= */
function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-white px-4 py-10 sm:px-6 sm:py-12"
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mb-6"
      >
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Easy to join. Clear from day one.
        </h2>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            variants={cardIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={i}
            className="rounded-[1.8rem] border border-black/10 bg-[#f8f8f8] p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="text-sm font-semibold tracking-[0.18em] text-black/55">
                {step.number}
              </div>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <h3 className="text-lg font-semibold text-black">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-black/60">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* =========================
   WHO CAN APPLY
========================= */
function WhoCanApplySection() {
  return (
    <section className="bg-[#fafafa] px-4 py-10 sm:px-6 sm:py-12">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.04)]"
        >
          <SectionLabel>Who can apply</SectionLabel>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
            Made for creators with style and intent.
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/60">
            We’re looking for creators who bring consistency, visual taste,
            authentic audience connection, and content that feels naturally
            aligned with fashion and styling.
          </p>

          <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-[#f7f7f7] p-4">
            <p className="text-sm font-semibold text-black">What we value most</p>
            <p className="mt-1 text-sm leading-6 text-black/60">
              Aesthetic alignment, storytelling, quality content, audience trust,
              and a strong creator identity.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-3">
          {fitFor.map((item, i) => (
            <motion.div
              key={item}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              className="flex items-start gap-3 rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-black">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-black/75">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   CTA
========================= */
function CTASection() {
  return (
    <section className="bg-white px-4 py-10 pb-24 sm:px-6">
      <motion.div
        variants={cardIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-black px-5 py-8 text-white shadow-[0_20px_45px_rgba(0,0,0,0.12)] sm:px-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_22%)]" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-white/80" />
            The FitCheck Edit
          </div>

          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
            Ready to create with Miray?
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/70 sm:text-[15px]">
            Join our creator collaboration program and turn your personal style
            into meaningful fashion content and collaboration opportunities.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/the-FitCheck-Edit/apply"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:translate-y-[-1px]"
            >
              Join The FitCheck Edit
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium text-white/70">
              Takes only a couple of minutes
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* =========================
   PAGE
========================= */
export default function TheFitCheckEditPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <HeroSection />
      <PerksSection />
      <HowItWorksSection />
      <WhoCanApplySection />
      <CTASection />
    </main>
  );
}