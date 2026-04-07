"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Briefcase,
  Sparkles,
  FileText,
  Instagram,
  Facebook,
  Youtube,
  Loader2,
} from "lucide-react";
import useInfluencerProgramStore from "@/store/influencerProgramStore";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

function SoftGlow({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
    />
  );
}

function StepPill({ active, done, children }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold transition ${
        active
          ? "bg-black text-white"
          : done
          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
          : "bg-black/[0.05] text-black/55"
      }`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="mb-4">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">
        {title}
      </h2>
      {text ? <p className="mt-1.5 text-sm text-black/60">{text}</p> : null}
    </div>
  );
}

function Field({ label, icon: Icon, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[12px] font-medium text-black/75">
        {Icon ? <Icon className="h-3.5 w-3.5 text-black/45" /> : null}
        <span>{label}</span>
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-4 focus:ring-black/[0.04] ${className}`}
    />
  );
}

function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/[0.04] ${className}`}
    />
  );
}

function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-[96px] w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/20 focus:ring-4 focus:ring-black/[0.04] ${className}`}
    />
  );
}

function SocialSection({ title, values = {}, icon: Icon, onChange, platformKey }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#fcfcfc] p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.05]">
          <Icon className="h-4 w-4 text-black/75" />
        </div>
        <p className="text-sm font-semibold text-black">{title}</p>
      </div>

      <div className="space-y-3">
        <Field label="Profile URL">
          <Input
            value={values?.url || ""}
            onChange={(e) => onChange(platformKey, "url", e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Followers">
            <Input
              type="number"
              min="0"
              value={values?.followers ?? ""}
              onChange={(e) => onChange(platformKey, "followers", e.target.value)}
              placeholder="0"
            />
          </Field>

          <Field label="Avg views">
            <Input
              type="number"
              min="0"
              value={values?.avgViews ?? ""}
              onChange={(e) => onChange(platformKey, "avgViews", e.target.value)}
              placeholder="0"
            />
          </Field>

          <Field label="Engagement %">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={values?.engagementRate ?? ""}
              onChange={(e) =>
                onChange(platformKey, "engagementRate", e.target.value)
              }
              placeholder="0"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function SuccessView({ influencer }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-6 sm:px-6">
      <SoftGlow className="left-[-40px] top-[-40px] h-32 w-32 bg-black/[0.04]" />
      <SoftGlow className="bottom-[-40px] right-[-40px] h-40 w-40 bg-green-500/[0.08]" />

      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-2xl place-items-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)] sm:p-7"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
            Application submitted
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
            Thank you for applying
          </h1>

          <p className="mt-2 text-sm leading-6 text-black/60">
            We’ve received your application for <b>The FitCheck Edit</b>. Someone
            from our team will review it and reach out soon if there’s a fit.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/8 bg-[#fafafa] p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                Applicant
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {influencer?.fullName || "Creator"}
              </p>
            </div>

            <div className="rounded-2xl border border-black/8 bg-[#fafafa] p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                Creator code
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {influencer?.code || "Will be assigned"}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Go to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function TheFitCheckEditApplyPage() {
  const {
    form,
    updateField,
    updateSocial,
    submitForm,
    isSubmitting,
    error,
    success,
    submittedInfluencer,
  } = useInfluencerProgramStore();

  const [step, setStep] = useState(1);

  const steps = useMemo(
    () => [
      { id: 1, label: "Basic" },
      { id: 2, label: "Socials" },
      { id: 3, label: "Submit" },
    ],
    []
  );

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm();
  };

  if (success && submittedInfluencer) {
    return <SuccessView influencer={submittedInfluencer} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <SoftGlow className="left-[-40px] top-[-40px] h-32 w-32 bg-black/[0.04]" />
      <SoftGlow className="bottom-[-40px] right-[-40px] h-40 w-40 bg-[#800020]/[0.05]" />

      <section className="px-4 pb-16 pt-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Link
              href="/the-FitCheck-Edit"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-black/60 transition hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to program
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-4 rounded-[1.6rem] border border-black/10 bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.04)] sm:p-6"
          >
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                Creator application
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-black sm:text-4xl">
                Apply for The FitCheck Edit
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-black/60">
                Share your details and socials. The form is short and simple.
              </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {steps.map((item) => (
                <StepPill
                  key={item.id}
                  active={step === item.id}
                  done={step > item.id}
                >
                  Step {item.id} · {item.label}
                </StepPill>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl border border-black/8 bg-[#fcfcfc] p-4"
                >
                  <SectionTitle
                    eyebrow="Step 1"
                    title="Basic details"
                    text="Tell us a little about yourself."
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Full name" icon={User} required>
                      <Input
                        value={form.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </Field>

                    <Field label="Email address" icon={Mail}>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>

                    <Field label="Mobile number" icon={Phone}>
                      <Input
                        value={form.mobile}
                        onChange={(e) => updateField("mobile", e.target.value)}
                        placeholder="Your contact number"
                      />
                    </Field>

                    <Field label="Niche" icon={Tag}>
                      <Input
                        value={form.niche}
                        onChange={(e) => updateField("niche", e.target.value)}
                        placeholder="Fashion, lifestyle, styling..."
                      />
                    </Field>

                    <Field label="City" icon={MapPin}>
                      <Input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Your city"
                      />
                    </Field>

                    <Field label="State" icon={MapPin}>
                      <Input
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="Your state"
                      />
                    </Field>

                    <Field label="Collaboration type" icon={Briefcase}>
                      <Select
                        value={form.collaborationType}
                        onChange={(e) =>
                          updateField("collaborationType", e.target.value)
                        }
                      >
                        <option value="barter">Barter</option>
                        <option value="paid">Paid</option>
                      </Select>
                    </Field>

                    <Field label="How did you find us?" icon={Sparkles}>
                      <Input
                        value={form.source}
                        onChange={(e) => updateField("source", e.target.value)}
                        placeholder="Instagram, referral, friend..."
                      />
                    </Field>
                  </div>

                  <div className="mt-3">
                    <Field label="Notes / Tell us about your content" icon={FileText}>
                      <TextArea
                        value={form.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="I create fashion reels, fit checks, styling videos..."
                      />
                    </Field>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl border border-black/8 bg-[#fcfcfc] p-4"
                >
                  <SectionTitle
                    eyebrow="Step 2"
                    title="Social profiles"
                    text="Add your platform details."
                  />

                  <div className="space-y-3">
                    <SocialSection
                      title="Instagram"
                      icon={Instagram}
                      platformKey="instagram"
                      values={form.socials?.instagram}
                      onChange={updateSocial}
                    />

                    <SocialSection
                      title="Facebook"
                      icon={Facebook}
                      platformKey="facebook"
                      values={form.socials?.facebook}
                      onChange={updateSocial}
                    />

                    <SocialSection
                      title="YouTube"
                      icon={Youtube}
                      platformKey="youtube"
                      values={form.socials?.youtube}
                      onChange={updateSocial}
                    />

                    <SocialSection
                      title="Other Platform"
                      icon={Sparkles}
                      platformKey="other"
                      values={form.socials?.other}
                      onChange={updateSocial}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl border border-black/8 bg-[#fcfcfc] p-4"
                >
                  <SectionTitle
                    eyebrow="Step 3"
                    title="Review & submit"
                    text="Everything looks good? Submit your application."
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-black/8 bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                        Name
                      </p>
                      <p className="mt-1 text-sm font-semibold text-black">
                        {form.fullName || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-black/8 bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-semibold text-black">
                        {form.email || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-black/8 bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                        Mobile
                      </p>
                      <p className="mt-1 text-sm font-semibold text-black">
                        {form.mobile || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-black/8 bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                        Collaboration
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-black">
                        {form.collaborationType || "-"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-black/50">
                    By applying, you agree to share your details for collaboration
                    review by the Miray team.
                  </p>
                </motion.div>
              )}

              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              ) : null}

              <div className="flex flex-col gap-2 border-t border-black/8 pt-4 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit application
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}