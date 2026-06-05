"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Tag,
  User,
  Youtube,
} from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import useInfluencerProgramStore from "@/store/influencerProgramStore";

const PROGRAM_NAME = "OATCLUB EDIT";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

function Field({ label, icon: Icon, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-black/45">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
        {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="h-11 w-full border border-black/10 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-black outline-none placeholder:text-black/30 focus:border-black"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="h-11 w-full border border-black/10 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-black outline-none focus:border-black"
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full resize-y border border-black/10 bg-white px-3 py-3 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black outline-none placeholder:text-black/30 focus:border-black"
    />
  );
}

function Progress({ steps, step }) {
  return (
    <div className="grid grid-cols-3 border border-black/10">
      {steps.map((item) => {
        const active = step === item.id;
        const done = step > item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`h-10 border-r border-black/10 text-[9px] font-black uppercase tracking-[0.14em] last:border-r-0 ${
              active ? "bg-black text-white" : done ? "bg-[#f4f4f4] text-black" : "bg-white text-black/45"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SocialSection({ title, icon: Icon, values = {}, platformKey, onChange }) {
  return (
    <section className="border border-black/10 bg-white p-3">
      <div className="mb-3 flex items-center gap-2 border-b border-black/10 pb-3">
        <span className="grid h-8 w-8 place-items-center bg-black text-white">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-xs font-black uppercase tracking-[0.12em]">{title}</h3>
      </div>

      <div className="grid gap-2.5">
        <Field label="Profile URL">
          <Input
            value={values?.url || ""}
            onChange={(event) => onChange(platformKey, "url", event.target.value)}
            placeholder="HTTPS://..."
          />
        </Field>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Field label="Followers">
            <Input
              type="number"
              min="0"
              value={values?.followers ?? ""}
              onChange={(event) => onChange(platformKey, "followers", event.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Avg Views">
            <Input
              type="number"
              min="0"
              value={values?.avgViews ?? ""}
              onChange={(event) => onChange(platformKey, "avgViews", event.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Engagement %">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={values?.engagementRate ?? ""}
              onChange={(event) => onChange(platformKey, "engagementRate", event.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function SuccessView({ influencer }) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-3 py-8 text-black">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg border border-black/10 bg-white p-4 shadow-[0_18px_55px_rgba(0,0,0,0.05)] md:p-6"
      >
        <div className="grid h-12 w-12 place-items-center bg-black text-white">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.24em] text-black/40">
          APPLICATION SUBMITTED
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase leading-tight">
          THANK YOU FOR APPLYING
        </h1>
        <p className="mt-2 text-[12px] font-bold uppercase leading-6 tracking-[0.06em] text-black/55">
          We received your application for {PROGRAM_NAME}. Our team will review it and reach out
          if there is a strong fit.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="border border-black/10 bg-[#fbfbfb] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/40">Applicant</p>
            <p className="mt-1 text-sm font-black uppercase">{influencer?.fullName || "Creator"}</p>
          </div>
          <div className="border border-black/10 bg-[#fbfbfb] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/40">Edit Code</p>
            <p className="mt-1 text-sm font-black uppercase">{influencer?.code || "Will Be Assigned"}</p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-5 flex h-11 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.18em] text-white"
        >
          GO HOME
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.section>
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
      { id: 1, label: "BASIC" },
      { id: 2, label: "SOCIALS" },
      { id: 3, label: "SUBMIT" },
    ],
    []
  );

  const nextStep = () => setStep((value) => Math.min(value + 1, 3));
  const prevStep = () => setStep((value) => Math.max(value - 1, 1));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitForm();
  };

  if (success && submittedInfluencer) return <SuccessView influencer={submittedInfluencer} />;

  return (
    <main className="min-h-screen bg-white px-3 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/the-oatclub-edit"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/50 underline underline-offset-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO PROGRAM
        </Link>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="border border-black bg-black p-4 text-white md:p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/50">
              EDIT APPLICATION
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase leading-[1.02] md:text-5xl">
              APPLY FOR {PROGRAM_NAME}
            </h1>
            <p className="mt-3 text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-white/62">
              Share your details and socials. The form is focused, direct and built for quick
              curation.
            </p>

            <div className="mt-5 grid gap-2 border-t border-white/15 pt-4">
              {["Clean creator profile", "Fashion or lifestyle niche", "Active social links"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
                  <CheckCircle2 className="h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="border border-black/10 bg-white p-3 md:p-5"
          >
            <Progress steps={steps} step={step} />

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {step === 1 ? (
                <section className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/40">
                      STEP 01
                    </p>
                    <h2 className="mt-1 text-lg font-black uppercase">BASIC DETAILS</h2>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Field label="Full Name" icon={User} required>
                      <Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="YOUR FULL NAME" required />
                    </Field>
                    <Field label="Email Address" icon={Mail}>
                      <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="YOU@EXAMPLE.COM" />
                    </Field>
                    <Field label="Mobile Number" icon={Phone}>
                      <Input value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} placeholder="YOUR CONTACT NUMBER" />
                    </Field>
                    <Field label="Niche" icon={Tag}>
                      <Input value={form.niche} onChange={(e) => updateField("niche", e.target.value)} placeholder="FASHION, LIFESTYLE..." />
                    </Field>
                    <Field label="City" icon={MapPin}>
                      <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="YOUR CITY" />
                    </Field>
                    <Field label="State" icon={MapPin}>
                      <Input value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="YOUR STATE" />
                    </Field>
                    <Field label="Collaboration Type" icon={Sparkles}>
                      <Select value={form.collaborationType} onChange={(e) => updateField("collaborationType", e.target.value)}>
                        <option value="barter">BARTER</option>
                        <option value="paid">PAID</option>
                      </Select>
                    </Field>
                    <Field label="How Did You Find Us?" icon={Sparkles}>
                      <Input value={form.source} onChange={(e) => updateField("source", e.target.value)} placeholder="INSTAGRAM, REFERRAL..." />
                    </Field>
                  </div>

                    <Field label="Notes / Content Style" icon={FileText}>
                    <TextArea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="I CREATE FASHION REELS, STYLE EDITS..." />
                  </Field>
                </section>
              ) : null}

              {step === 2 ? (
                <section className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/40">
                      STEP 02
                    </p>
                    <h2 className="mt-1 text-lg font-black uppercase">SOCIAL PROFILES</h2>
                  </div>

                  <SocialSection title="Instagram" icon={Instagram} platformKey="instagram" values={form.socials?.instagram} onChange={updateSocial} />
                  <SocialSection title="Facebook" icon={FaFacebookF} platformKey="facebook" values={form.socials?.facebook} onChange={updateSocial} />
                  <SocialSection title="YouTube" icon={Youtube} platformKey="youtube" values={form.socials?.youtube} onChange={updateSocial} />
                  <SocialSection title="Other Platform" icon={Sparkles} platformKey="other" values={form.socials?.other} onChange={updateSocial} />
                </section>
              ) : null}

              {step === 3 ? (
                <section className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/40">
                      STEP 03
                    </p>
                    <h2 className="mt-1 text-lg font-black uppercase">REVIEW & SUBMIT</h2>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["Name", form.fullName || "-"],
                      ["Email", form.email || "-"],
                      ["Mobile", form.mobile || "-"],
                      ["Collab", form.collaborationType || "-"],
                    ].map(([label, value]) => (
                      <div key={label} className="border border-black/10 bg-[#fbfbfb] p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/40">
                          {label}
                        </p>
                        <p className="mt-1 text-xs font-black uppercase text-black">{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-bold uppercase leading-5 tracking-[0.06em] text-black/50">
                    By applying, you agree to share your details for collaboration curation by the
                    OATCLUB team.
                  </p>
                </section>
              ) : null}

              {error ? (
                <p className="border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold uppercase leading-5 text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="grid gap-2 border-t border-black/10 pt-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex h-11 items-center justify-center gap-2 border border-black text-[10px] font-black uppercase tracking-[0.18em] text-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                  PREVIOUS
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex h-11 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.18em] text-white"
                  >
                    NEXT
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "SUBMITTING" : "SUBMIT APPLICATION"}
                  </button>
                )}
              </div>
            </form>
          </motion.section>
        </section>
      </div>
    </main>
  );
}
