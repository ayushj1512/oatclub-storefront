"use client";

import { useState, useEffect, useMemo } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

/* 🔥 Shimmer block */
function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const [shake, setShake] = useState(false);

  /* mount shimmer */
  const [mountLoading, setMountLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMountLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL +
    "/api/newsletters/subscribe";

  // --------------------------------------------
  // 📌 Email Suggestions (React-correct)
  // --------------------------------------------
  const suggestions = useMemo(() => {
    if (!email.includes("@") || email.includes(".com")) return [];

    const [name, domain = ""] = email.split("@");

    return ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
      .filter((d) => d.startsWith(domain))
      .map((d) => `${name}@${d}`);
  }, [email]);

  // --------------------------------------------
  // 📌 Submit
  // --------------------------------------------
  const isValidEmail = (e) =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return setState({
        loading: false,
        success: false,
        error: "Enter a valid email.",
      });
    }

    setState({ loading: true, success: false, error: "" });

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          loading: false,
          success: false,
          error: data.message || "Something went wrong.",
        });
        return;
      }

      setState({ loading: false, success: true, error: "" });
      setEmail("");
    } catch {
      setState({
        loading: false,
        success: false,
        error: "Network error.",
      });
    }
  };

  return (
    <section className="w-full bg-white pt-4 px-5 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="w-full max-w-md text-center"
      >
        {mountLoading ? (
          <>
            <div className="flex justify-center mb-3">
              <Shimmer className="w-8 h-8 rounded-full" />
            </div>

            <div className="flex justify-center mb-2">
              <Shimmer className="h-5 w-40 rounded" />
            </div>

            <div className="flex justify-center mb-5">
              <Shimmer className="h-3 w-56 rounded" />
            </div>

            <div className="flex w-full border border-gray-200 rounded-xl overflow-hidden">
              <Shimmer className="h-10 flex-1" />
              <Shimmer className="h-10 w-20" />
            </div>
          </>
        ) : (
          <>
            <Mail className="w-8 h-8 text-black mx-auto mb-2" />

            <h2 className="text-lg md:text-xl font-semibold text-black mb-1">
              Stay Updated
            </h2>

            <p className="text-gray-600 text-xs md:text-sm mb-5">
              Get new arrivals and exclusive offers.
            </p>

            {!state.success ? (
              <>
                <motion.form
                  onSubmit={handleSubmit}
                  animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  className="flex w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none placeholder-gray-400"
                  />

                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-4 bg-black text-white flex items-center gap-1 text-sm font-medium active:scale-95 transition disabled:opacity-60 hover:bg-black/90"
                  >
                    {state.loading ? "..." : "Go"}
                    {!state.loading && (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </motion.form>

                {suggestions.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl mt-2 p-2 shadow-sm text-left">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setEmail(s)}
                        className="block w-full text-xs py-1 px-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {state.error && (
                  <p className="text-red-600 text-xs mt-2">
                    {state.error}
                  </p>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm text-black mt-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Subscribed!
                </span>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}
