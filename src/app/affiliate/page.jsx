"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";

import { useAffiliateStore } from "@/store/affiliateStore";

export default function AffiliateLoginPage() {
  const router = useRouter();

  const {
    token,
    affiliate,
    login,
    authLoading,
    error,
    clearFeedback,
  } = useAffiliateStore();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token && affiliate?._id) {
      router.replace("/affiliate/dashboard");
    }
  }, [token, affiliate, router]);

  const updateField = (field, value) => {
    clearFeedback();

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim() || !form.password) return;

    try {
      await login({
        username: form.username.trim(),
        password: form.password,
      });

      router.replace("/affiliate/dashboard");
    } catch {}
  };

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col">
        <header className="flex items-center justify-between border-b border-black pb-4">
          <p className="text-sm font-black tracking-[-0.03em]">
            OATCLUB
          </p>

          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            Affiliate Portal
          </p>
        </header>

        <section className="flex flex-1 items-center py-12">
          <div className="w-full">
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Private access
              </p>

              <h1 className="mt-5 max-w-md text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">
                Your influence,
                <br />
                your results.
              </h1>

              <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-500">
                Sign in to view coupon orders, commission status and
                upcoming payouts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <label className="block">
                <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Username
                </span>

                <div className="relative border-b border-neutral-300 transition focus-within:border-black">
                  <User
                    size={17}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    value={form.username}
                    onChange={(event) =>
                      updateField("username", event.target.value)
                    }
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="h-14 w-full bg-transparent pl-8 pr-3 text-base outline-none placeholder:text-neutral-300"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Password
                </span>

                <div className="relative border-b border-neutral-300 transition focus-within:border-black">
                  <Lock
                    size={17}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-14 w-full bg-transparent pl-8 pr-10 text-base outline-none placeholder:text-neutral-300"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-black"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>

              {error ? (
                <p className="border-l-2 border-red-500 pl-3 text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={
                  authLoading ||
                  !form.username.trim() ||
                  !form.password
                }
                className="group flex h-14 w-full items-center justify-between bg-black px-5 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  {authLoading ? "Signing in" : "Enter dashboard"}
                </span>

                {authLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowUpRight
                    size={18}
                    className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            <div className="mt-10 grid grid-cols-3 border-y border-neutral-200 py-5">
              {[
                ["Orders", "Track"],
                ["Earnings", "Review"],
                ["Payouts", "Manage"],
              ].map(([title, label]) => (
                <div
                  key={title}
                  className="border-r border-neutral-200 px-3 text-center last:border-r-0"
                >
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-neutral-200 pt-4 text-[10px] uppercase tracking-[0.14em] text-neutral-400">
          <span>Own All Trends</span>
          <span>Affiliate Access</span>
        </footer>
      </div>
    </main>
  );
}