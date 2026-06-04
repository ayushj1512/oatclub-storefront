"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, UserPlus } from "lucide-react";
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
    <main className="min-h-screen bg-[#fafafa] px-3 py-6 text-black md:py-10">
      <section className="mx-auto w-full max-w-md bg-white px-4 py-6 md:px-6 md:py-7">
        <div className="mb-6 text-center">
          <Link href="/" aria-label="GO TO OATCLUB HOME" className="mx-auto mb-5 block w-fit">
            <div className="relative h-12 w-36 md:h-14 md:w-40">
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
          <div className="mx-auto mb-5 h-px w-16 bg-black/15" />
          <p className="text-[9px] font-black uppercase tracking-[0.32em] text-black/45">
            JOIN OATCLUB
          </p>
          <h1 className="mt-2 text-xl font-black uppercase leading-tight md:text-2xl">
            CREATE ACCOUNT
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-[10px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
            START YOUR STYLE EDIT WITH FASTER CHECKOUT, ORDERS AND CREDITS.
          </p>
        </div>

        <div>
          {loading ? (
            <UniversalLuxuryLoader />
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-3">
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

                {error ? <p className="text-xs font-bold uppercase text-red-600">{error}</p> : null}

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 bg-black text-xs font-black uppercase tracking-[0.24em] text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  CREATE ACCOUNT
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">OR</span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>

              <GoogleSignInButton />

              <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-black/50">
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
    <label className="flex h-12 items-center gap-3 border border-black/10 bg-neutral-50 px-4">
      <span className="text-black/45">{icon}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-xs font-bold uppercase tracking-[0.12em] text-black outline-none placeholder:text-black/35"
      />
    </label>
  );
}
