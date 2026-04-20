"use client";

import { useEffect, useState } from "react";
import { X, MessageCircle, Sparkles } from "lucide-react";

export default function InstagramDownModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-3 py-4 sm:px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.18)] animate-[modalIn_.28s_ease]">
        {/* top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-black via-gray-500 to-gray-200" />

        {/* close */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 transition hover:bg-gray-100 hover:text-black"
        >
          <X size={17} />
        </button>

        <div className="px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          {/* badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-600">
            <Sparkles size={13} className="text-black" />
            Quick Update
          </div>

          {/* header */}
          <div className="mb-4 flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <MessageCircle size={20} className="text-black" />
            </div>

            <div>
              <h2 className="text-xl font-semibold leading-tight text-black sm:text-2xl">
                Hey there 👋
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Instagram is temporarily unavailable
              </p>
            </div>
          </div>

          {/* content */}
          <div className="space-y-3 text-sm leading-6 text-gray-700 sm:text-[15px]">
            <p>
              If you need any help, order support, or have a quick question,
              please reach out to us on WhatsApp.
            </p>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
              We’re active there and happy to assist you.
            </div>

            <p className="text-gray-500">
              Apologies for the inconvenience, and thanks for your patience.
            </p>
          </div>

          {/* actions */}
          <div className="mt-5 flex flex-col gap-3 sm:mt-6">
            <a
              href="https://wa.me/917303491206?text=Hi%20I%20came%20from%20your%20website%2C%20I%20have%20a%20query."
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black bg-black px-4 py-3.5 text-sm font-medium text-white transition hover:bg-gray-900"
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}