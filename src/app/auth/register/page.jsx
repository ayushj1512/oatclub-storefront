"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";
import { useAuthStore } from "@/store/authStore";

const AUTH_IMAGE =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

export default function RegisterPage() {
  const router = useRouter();
  const registerWithEmail = useAuthStore((s) => s.registerWithEmail);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("PASSWORDS DO NOT MATCH");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.name);
      router.push("/profile");
    } catch (err) {
      setError(err?.message || "REGISTRATION FAILED");
    } finally {
      setLoading(false);
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
            JOIN THE EDIT
          </p>
          <h1 className="mt-1.5 text-[22px] font-black uppercase leading-tight md:text-2xl">
            CREATE ACCOUNT
          </h1>
          <p className="mx-auto mt-2 max-w-[290px] text-[9.5px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
            BUILD YOUR OATCLUB PROFILE FOR SAVED DETAILS, CREDITS AND ORDERS.
          </p>
        </div>

        <div>
          {loading ? (
            <UniversalLuxuryLoader />
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-2.5">
                <Field
                  icon={<User className="h-4 w-4" />}
                  placeholder="FULL NAME"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                />
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="EMAIL ADDRESS"
                  type="email"
                  value={form.email}
                  onChange={(value) => setForm({ ...form, email: value })}
                />
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="PASSWORD"
                  type="password"
                  value={form.password}
                  onChange={(value) => setForm({ ...form, password: value })}
                />
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="CONFIRM PASSWORD"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(value) => setForm({ ...form, confirmPassword: value })}
                />

                {error ? <p className="text-[10px] font-bold uppercase leading-4 text-red-600">{error}</p> : null}

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800"
                >
                  <UserPlus className="h-4 w-4" />
                  CREATE ACCOUNT
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-black/35">OR</span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>

              <GoogleSignInButton />

              <div className="mt-4 flex items-center justify-center gap-2 border-y border-black/10 py-2 text-[8.5px] font-black uppercase tracking-[0.14em] text-black/45">
                <ShieldCheck className="h-3.5 w-3.5" />
                SECURE MEMBER CHECKOUT
              </div>

              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-black/50">
                ALREADY A MEMBER?{" "}
                <Link href="/auth/login" className="font-black text-black underline underline-offset-4">
                  SIGN IN
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }) {
  return (
    <label className="flex h-11 items-center gap-3 border border-black/10 bg-white px-3.5 transition focus-within:border-black">
      <span className="text-black/45">{icon}</span>
      <input
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
