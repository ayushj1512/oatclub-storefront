"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import toast from "react-hot-toast";

import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

const AUTH_IMAGE =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const registerWithEmail = useAuthStore(
    (state) => state.registerWithEmail,
  );

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    const name = form.name.trim();

    const email = form.email
      .trim()
      .toLowerCase();

    if (name.length < 2) {
      setError(
        "PLEASE ENTER YOUR FULL NAME",
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setError(
        "PLEASE ENTER A VALID EMAIL ADDRESS",
      );

      return;
    }

    if (form.password.length < 6) {
      setError(
        "PASSWORD MUST HAVE AT LEAST 6 CHARACTERS",
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "PASSWORDS DO NOT MATCH",
      );

      return;
    }

    try {
      setLoading(true);

      await registerWithEmail(
        email,
        form.password,
        name,
      );

      toast.success(
        "WELCOME TO OATCLUB",
      );

      router.replace("/profile");
    } catch (err) {
      const message =
        err?.message ||
        "REGISTRATION FAILED";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[100dvh] overflow-hidden bg-white text-black md:bg-[#fafafa]">
      <div className="h-full overflow-y-auto px-3 py-3 [scrollbar-width:none] md:flex md:items-center md:justify-center md:py-5 [&::-webkit-scrollbar]:hidden">
        <section className="mx-auto w-full max-w-[410px] border border-black/10 bg-white px-4 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.04)] sm:px-5 md:px-6 md:py-5">
          <RegisterHeader />

          <form
            onSubmit={handleRegister}
            className="space-y-2.5"
          >
            <Field
              icon={
                <User className="h-4 w-4" />
              }
              placeholder="Your lovely name"
              value={form.name}
              autoComplete="name"
              onChange={(value) =>
                updateField(
                  "name",
                  value,
                )
              }
            />

            <Field
              icon={
                <Mail className="h-4 w-4" />
              }
              placeholder="you@example.com"
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(value) =>
                updateField(
                  "email",
                  value,
                )
              }
            />

            <PasswordField
              placeholder="Create a secret password"
              value={form.password}
              visible={showPassword}
              autoComplete="new-password"
              onToggle={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              onChange={(value) =>
                updateField(
                  "password",
                  value,
                )
              }
            />

            <PasswordField
              placeholder="Type it once more"
              value={
                form.confirmPassword
              }
              visible={
                showConfirmPassword
              }
              autoComplete="new-password"
              onToggle={() =>
                setShowConfirmPassword(
                  (current) => !current,
                )
              }
              onChange={(value) =>
                updateField(
                  "confirmPassword",
                  value,
                )
              }
            />

            {form.password &&
              form.confirmPassword &&
              form.password ===
              form.confirmPassword ? (
              <div className="flex items-center gap-1.5 px-1 text-[8.5px] font-black uppercase tracking-[0.12em] text-green-700">
                <Check className="h-3 w-3" />
                Passwords match
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="text-[9px] font-bold uppercase leading-4 text-red-600"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}

              {loading
                ? "CREATING YOUR ACCOUNT"
                : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="my-3.5 flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-200" />

            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-black/35">
              OR
            </span>

            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          <GoogleSignInButton />

          <div className="mt-3.5 flex items-center justify-center gap-2 border-y border-black/10 py-2 text-[8.5px] font-black uppercase tracking-[0.14em] text-black/45">
            <ShieldCheck className="h-3.5 w-3.5" />
            SECURE MEMBER CHECKOUT
          </div>

          <p className="mt-3.5 text-center text-[9.5px] font-bold uppercase tracking-[0.1em] text-black/50">
            ALREADY PART OF THE CLUB?{" "}

            <Link
              href="/auth/login"
              className="font-black text-black underline underline-offset-4"
            >
              SIGN IN
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function RegisterHeader() {
  return (
    <div className="mb-4 text-center">
      <Link
        href="/"
        aria-label="Go to OATCLUB home"
        className="mx-auto mb-3 block w-fit"
      >
        <div className="relative h-9 w-28 sm:h-10 sm:w-32 md:h-11 md:w-36">
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

      <div className="mx-auto mb-3 flex w-24 items-center gap-2">
        <span className="h-px flex-1 bg-black/15" />
        <span className="h-1 w-1 rounded-full bg-black/35" />
        <span className="h-px flex-1 bg-black/15" />
      </div>

      <p className="text-[8px] font-black uppercase tracking-[0.32em] text-black/45">
        JOIN THE EDIT
      </p>

      <h1 className="mt-1 text-xl font-black uppercase leading-tight sm:text-[22px] md:text-2xl">
        CREATE ACCOUNT
      </h1>

      <p className="mx-auto mt-1.5 max-w-[300px] text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-black/50">
        YOUR OATCLUB WORLD STARTS HERE —
        SAVE DETAILS, CREDITS AND ORDERS.
      </p>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
}) {
  return (
    <label className="flex h-11 items-center gap-3 border border-black/10 bg-white px-3.5 transition focus-within:border-black">
      <span className="shrink-0 text-black/45">
        {icon}
      </span>

      <input
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-black outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-black/30"
      />
    </label>
  );
}

function PasswordField({
  placeholder,
  value,
  visible,
  autoComplete,
  onChange,
  onToggle,
}) {
  return (
    <label className="flex h-11 items-center gap-3 border border-black/10 bg-white px-3.5 transition focus-within:border-black">
      <Lock className="h-4 w-4 shrink-0 text-black/45" />

      <input
        type={
          visible ? "text" : "password"
        }
        required
        minLength={6}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-black outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-black/30"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={
          visible
            ? "Hide password"
            : "Show password"
        }
        className="flex h-8 w-8 shrink-0 items-center justify-center text-black/40 transition hover:text-black"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </label>
  );
}
