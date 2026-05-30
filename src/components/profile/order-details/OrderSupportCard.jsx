"use client";

import {
  Headphones,
  ShieldCheck,
  RotateCcw,
  Package,
  MessageCircle,
} from "lucide-react";

export default function OrderSupportCard({
  order,
}) {
  return (
    <div className="rounded-3xl bg-black p-4 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
            <Headphones size={16} />
          </span>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Support
            </p>

            <h2 className="text-base font-black">
              Need Help?
            </h2>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-black transition hover:opacity-90"
        >
          <MessageCircle size={13} />
          Contact
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-white/65">
        Order issue, payment concern, delivery delay,
        exchange or return request — our support team
        is here to help.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} />
            <p className="text-xs font-bold">
              Protected
            </p>
          </div>

          <p className="mt-1 text-[11px] text-white/60">
            Secure order handling.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="flex items-center gap-2">
            <RotateCcw size={13} />
            <p className="text-xs font-bold">
              Returns
            </p>
          </div>

          <p className="mt-1 text-[11px] text-white/60">
            Easy return & exchange.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="flex items-center gap-2">
            <Package size={13} />
            <p className="text-xs font-bold">
              Tracking
            </p>
          </div>

          <p className="mt-1 text-[11px] text-white/60">
            Live shipment updates.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
            Order Reference
          </p>

          <p className="text-xs font-black">
            {order?.orderNumber || "-"}
          </p>
        </div>

        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70">
          24×7 Support
        </span>
      </div>
    </div>
  );
}