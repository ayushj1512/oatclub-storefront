"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export default function CodConfirmCaptcha({ open, onClose, onVerified }) {
  const [captcha, setCaptcha] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCaptcha(generateCaptcha());
    setInput("");
    setError(false);
    setLoading(false);
    setSuccess(false);
  }, [open]);

  if (!open) return null;

  const verify = () => {
    if (loading || success) return;
    if (input !== captcha) return setError(true);

    setError(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onVerified?.();
        onClose?.();
      }, 600);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-sm border border-neutral-200 bg-white p-5 transition sm:p-6 ${
          error ? "animate-shake" : ""
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-neutral-200 bg-neutral-50">
            <ShieldCheck className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-black">
              Confirm Cash On Delivery
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
              One Last Step To Place Your Order
            </p>
          </div>
        </div>

        <div className="mb-4 border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex select-none gap-1 text-xl font-black tracking-[0.22em] text-black">
              {captcha.split("").map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className={i % 2 ? "-rotate-6 translate-y-[2px]" : "rotate-6 -translate-y-[2px]"}
                >
                  {c}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCaptcha(generateCaptcha())}
              className="border border-neutral-200 bg-white p-2 transition hover:border-black"
            >
              <RefreshCcw className="h-4 w-4 text-black" />
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
            <Sparkles className="h-3 w-3" /> Enter Exactly As Shown
          </p>
        </div>

        <input
          value={input}
          disabled={loading || success}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setError(false);
          }}
          placeholder="ENTER CAPTCHA"
          className="h-12 w-full border border-neutral-300 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] outline-none transition placeholder:text-black/30 focus:border-black"
        />

        {error && (
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">
            Incorrect Code. Please Try Again.
          </p>
        )}

        <button
          type="button"
          onClick={verify}
          disabled={!input || loading || success}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-black text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 disabled:bg-black/20 disabled:text-black/40"
        >
          {loading && (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Verifying...
            </>
          )}
          {success && (
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center bg-white">
                <Check className="h-3.5 w-3.5 text-black" />
              </span>
              Verified
            </span>
          )}
          {!loading && !success && "Confirm COD Order"}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="mt-3 w-full text-[10px] font-black uppercase tracking-[0.14em] text-black/45 transition hover:text-black"
        >
          Cancel & Go Back
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.35s ease-in-out;
        }
      `}</style>
    </div>
  );
}
