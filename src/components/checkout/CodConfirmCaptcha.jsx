"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCcw, Sparkles, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
      <div className={`w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition ${error ? "animate-shake" : ""}`}>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-black/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Confirm Cash on Delivery</p>
            <p className="text-xs text-gray-500">One last step to place your order</p>
          </div>
        </div>

        {/* Captcha */}
        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 text-xl font-extrabold tracking-widest select-none text-black">
              {captcha.split("").map((c, i) => (
                <span key={i} className={i % 2 ? "-rotate-6 translate-y-[2px]" : "rotate-6 -translate-y-[2px]"}>{c}</span>
              ))}
            </div>
            <button onClick={() => setCaptcha(generateCaptcha())} className="p-2 rounded-full hover:bg-black/5 transition">
              <RefreshCcw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Enter exactly as shown
          </p>
        </div>

        {/* Input */}
        <input
          value={input}
          disabled={loading || success}
          onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(false); }}
          placeholder="Enter captcha"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)] focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.6)] transition"
        />

        {error && <p className="mt-2 text-xs text-red-600">Incorrect code. Please try again.</p>}

        {/* CTA */}
        <button
          onClick={verify}
          disabled={!input || loading || success}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-white bg-black shadow-[0_18px_40px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2 transition active:scale-[0.97] disabled:opacity-60"
        >
          {loading && <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying…</>}
          {success && <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><Check className="w-4 h-4 text-black" /></span>Verified</span>}
          {!loading && !success && "Confirm COD Order"}
        </button>

        <button onClick={onClose} disabled={loading} className="mt-3 w-full text-xs text-gray-500 hover:text-black transition">
          Cancel & go back
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake { 0%{transform:translateX(0)}25%{transform:translateX(-4px)}50%{transform:translateX(4px)}75%{transform:translateX(-3px)}100%{transform:translateX(0)} }
        .animate-shake { animation: shake 0.35s ease-in-out; }
      `}</style>
    </div>
  );
}
