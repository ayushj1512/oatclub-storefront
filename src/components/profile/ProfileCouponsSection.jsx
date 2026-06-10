"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, TicketPercent } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";

const money = (value) => `RS. ${Number(value || 0).toLocaleString("en-IN")}`;

const labelFor = (coupon) => {
  const type = String(coupon?.discountType || "").toLowerCase();
  const value = Number(coupon?.discountValue || 0);
  if (type === "flat") return `${money(value)} OFF`;
  if (value > 0) return `${value}% OFF`;
  return "SPECIAL OFFER";
};

const metaFor = (coupon) => {
  const min = Number(coupon?.minPurchase || 0);
  const source = String(coupon?.source || "").toLowerCase();
  if (source === "review") return "UNLOCKED FROM REVIEW";
  if (min > 0) return `MIN CART ${money(min)}`;
  return "AVAILABLE ON CHECKOUT";
};

export default function ProfileCouponsSection({ customer }) {
  const {
    fetchSuggestedCoupons,
    suggestedCoupons,
    earnedCoupons,
    isLoadingSuggestions,
    getMyCoupons,
  } = useCouponStore();
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetchSuggestedCoupons?.({
      cartTotal: 0,
      cartItems: [],
      email: customer?.email,
      phone: customer?.phone,
      customerId: customer?._id,
    });
  }, [fetchSuggestedCoupons, customer?.email, customer?.phone, customer?._id]);

  const coupons = useMemo(() => {
    const list = typeof getMyCoupons === "function"
      ? getMyCoupons()
      : [...(earnedCoupons || []), ...(suggestedCoupons || [])];

    const map = new Map();
    list.forEach((coupon) => {
      const code = String(coupon?.code || "").trim().toUpperCase();
      if (!code) return;
      map.set(code, { ...coupon, code });
    });
    return Array.from(map.values()).slice(0, 8);
  }, [earnedCoupons, suggestedCoupons, getMyCoupons]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied(""), 1100);
    } catch {
      setCopied(code);
    }
  };

  return (
    <section className="border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
            My coupons
          </p>
          <h3 className="mt-1 flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-black">
            <TicketPercent size={17} />
            Rewards & offers
          </h3>
        </div>
        <span className="border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-black/50">
          {coupons.length} saved
        </span>
      </div>

      {isLoadingSuggestions && !coupons.length ? (
        <div className="border border-dashed border-neutral-300 bg-neutral-50 p-4 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
          Loading coupons...
        </div>
      ) : coupons.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {coupons.map((coupon) => {
            const isReward = String(coupon.source || "").toLowerCase() === "review";
            return (
              <article
                key={coupon.code}
                className={`border p-3 ${
                  isReward ? "border-black bg-black text-white" : "border-neutral-200 bg-neutral-50 text-black"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${isReward ? "text-white/50" : "text-black/40"}`}>
                      {metaFor(coupon)}
                    </p>
                    <h4 className="mt-1 text-xl font-black uppercase tracking-[0.08em]">
                      {coupon.code}
                    </h4>
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                    isReward ? "bg-white text-black" : "bg-black text-white"
                  }`}>
                    {labelFor(coupon)}
                  </span>
                </div>

                <p className={`mt-2 line-clamp-2 text-[10px] font-bold uppercase leading-4 tracking-[0.08em] ${
                  isReward ? "text-white/58" : "text-black/48"
                }`}>
                  {coupon.description || coupon.title || "Apply this coupon during checkout."}
                </p>

                <button
                  type="button"
                  onClick={() => copyCode(coupon.code)}
                  className={`mt-3 flex h-10 w-full items-center justify-center gap-2 border text-[10px] font-black uppercase tracking-[0.14em] transition ${
                    isReward
                      ? "border-white/25 bg-white text-black"
                      : "border-black bg-white text-black hover:bg-black hover:text-white"
                  }`}
                >
                  <Copy size={14} />
                  {copied === coupon.code ? "Copied" : "Copy code"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
          <TicketPercent size={22} className="mx-auto text-black/45" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-black">
            No coupons yet
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black/45">
            Review delivered orders to unlock THANKU10.
          </p>
        </div>
      )}
    </section>
  );
}
