"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

const AUTH_IMAGE =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef(null);
  const { user, isAuthenticated, loginWithEmail } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (!emailFromUrl) return;
    setForm((prev) => ({ ...prev, email: emailFromUrl }));
    setTimeout(() => passwordRef.current?.focus(), 100);
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!justLoggedIn) toast.success(`WELCOME BACK, ${user.name || "OATCLUB MEMBER"}`);
      router.replace("/");
    }
  }, [isAuthenticated, user, justLoggedIn, router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(form.email, form.password);
      setJustLoggedIn(true);
      toast.success("WELCOME BACK TO OATCLUB");
      router.push("/");
    } catch (err) {
      setError(err?.message || "UNABLE TO SIGN IN. PLEASE TRY AGAIN.");
      toast.error("SIGN IN FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = String(form.email || "").trim().toLowerCase();
    if (!email) return toast.error("ENTER YOUR EMAIL FIRST");

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success("PASSWORD RESET LINK SENT");
    } catch {
      toast.error("FAILED TO SEND RESET EMAIL");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-3 py-5 text-black md:bg-[#fafafa] md:py-8">
      <section className="mx-auto w-full max-w-[410px] border border-black/10 bg-white px-4 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.04)] md:px-6 md:py-6">
        <div className="mb-5 text-center">
          <Link href="/" aria-label="GO TO OATCLUB HOME" className="mx-auto mb-4 block w-fit">
            <div className="relative h-10 w-32 md:h-12 md:w-36">
              <Image
                src={AUTH_IMAGE}
                alt="OATCLUB"
                fill
                priority
                sizes="160px"
                className="object-contain"
              />
            </div>
          </Link>
          <div className="mx-auto mb-4 flex w-24 items-center gap-2">
            <span className="h-px flex-1 bg-black/15" />
            <span className="h-1 w-1 rounded-full bg-black/35" />
            <span className="h-px flex-1 bg-black/15" />
          </div>
          <p className="text-[8.5px] font-black uppercase tracking-[0.32em] text-black/45">
            MEMBER ACCESS
          </p>
          <h1 className="mt-1.5 text-[22px] font-black uppercase leading-tight md:text-2xl">
            WELCOME BACK
          </h1>
          <p className="mx-auto mt-2 max-w-[290px] text-[9.5px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
            SIGN IN FOR FASTER CHECKOUT, SAVED EDITS AND ORDER UPDATES.
          </p>
        </div>

        <div>
          <form onSubmit={handleLogin} className="space-y-2.5">
            <Field
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="EMAIL ADDRESS"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />
            <Field
              refEl={passwordRef}
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="PASSWORD"
              value={form.password}
              onChange={(value) => setForm({ ...form, password: value })}
            />

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="pt-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-black/55 underline underline-offset-4"
            >
              {resetLoading ? "SENDING" : "FORGOT PASSWORD"}
            </button>

            {error ? <p className="text-[10px] font-bold uppercase leading-4 text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800 disabled:bg-neutral-300"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              SIGN IN
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-200" />
            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-black/35">OR</span>
            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          <GoogleSignIn />

          <div className="mt-4 flex items-center justify-center gap-2 border-y border-black/10 py-2 text-[8.5px] font-black uppercase tracking-[0.14em] text-black/45">
            <ShieldCheck className="h-3.5 w-3.5" />
            SECURE MEMBER CHECKOUT
          </div>

          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-black/50">
            NEW HERE?{" "}
            <Link href="/auth/register" className="font-black text-black underline underline-offset-4">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ icon, type, placeholder, value, onChange, refEl }) {
  return (
    <label className="flex h-11 items-center gap-3 border border-black/10 bg-white px-3.5 transition focus-within:border-black">
      <span className="text-black/45">{icon}</span>
      <input
        ref={refEl}
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-[11px] font-bold uppercase tracking-[0.12em] text-black outline-none placeholder:text-black/35"
      />
    </label>
  );
}
