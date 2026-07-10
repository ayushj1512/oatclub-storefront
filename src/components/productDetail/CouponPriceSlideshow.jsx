"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";

import { useCouponStore } from "@/store/couponStore";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const getOffer = (coupon, price) => {
  const minPurchase = Number(coupon?.minPurchase || 0);
  const minItems = Number(coupon?.quantityRule?.minItems || 0);
  const quantityEnabled = Boolean(coupon?.quantityRule?.enabled);

  if (minPurchase > price) {
    return {
      eligible: false,
      message: `Add ₹${money(minPurchase - price)} more`,
      discount: 0,
    };
  }

  if (quantityEnabled && minItems > 1) {
    const remaining = minItems - 1;

    return {
      eligible: false,
      message: `Add ${remaining} more item${remaining > 1 ? "s" : ""}`,
      discount: 0,
    };
  }

  const value = Number(coupon?.discountValue || 0);

  let discount =
    coupon?.discountType === "percentage"
      ? (price * value) / 100
      : value;

  const maxDiscount = Number(coupon?.maxDiscount || 0);

  if (maxDiscount > 0) {
    discount = Math.min(discount, maxDiscount);
  }

  discount = Math.min(discount, price);

  return {
    eligible: true,
    message: "Available now",
    discount,
  };
};

export default function CouponPriceSlideshow({ product }) {
  const price = Number(product?.price || 0);

  const suggestedCoupons = useCouponStore(
    (state) => state.suggestedCoupons
  );

  const fetchSuggestedCoupons = useCouponStore(
    (state) => state.fetchSuggestedCoupons
  );

  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!price) return;

    fetchSuggestedCoupons({
      cartTotal: price,
      cartItems: [
        {
          product,
          quantity: 1,
          price,
        },
      ],
    });
  }, [price, product, fetchSuggestedCoupons]);

  const coupons = useMemo(() => {
    return (Array.isArray(suggestedCoupons) ? suggestedCoupons : [])
      .filter(
        (coupon) =>
          coupon?.isActive &&
          String(coupon?.visibility || "public").toLowerCase() !==
            "private"
      )
      .map((coupon) => {
        const offer = getOffer(coupon, price);

        return {
          ...coupon,
          ...offer,
          bestPrice: Math.max(0, price - offer.discount),
        };
      })
      .sort((a, b) => {
        if (a.eligible !== b.eligible) {
          return Number(b.eligible) - Number(a.eligible);
        }

        return b.discount - a.discount;
      });
  }, [suggestedCoupons, price]);

  useEffect(() => {
    if (coupons.length <= 1) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % coupons.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, [coupons.length]);

  useEffect(() => {
    if (active >= coupons.length) {
      setActive(0);
    }
  }, [active, coupons.length]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);

      window.setTimeout(() => {
        setCopied("");
      }, 1200);
    } catch {}
  };

  if (!price || !coupons.length) return null;

  const coupon = coupons[active];

  const previous = () => {
    setActive((current) =>
      current === 0 ? coupons.length - 1 : current - 1
    );
  };

  const next = () => {
    setActive((current) =>
      current === coupons.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="overflow-hidden rounded-xl border border-black/10 bg-white lg:max-w-[520px]">
      <div className="grid min-h-[78px] grid-cols-[minmax(0,1fr)_84px_32px] items-center gap-3 px-3.5 py-2.5 lg:min-h-[70px] lg:grid-cols-[minmax(0,1fr)_78px_30px] lg:px-3 lg:py-2">
        <div className="min-w-0">
          <div className="flex min-h-6 flex-wrap items-center gap-2">
            <span className="text-[12px] font-extrabold tracking-[0.12em] text-black lg:text-[11px]">
              {coupon.code}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase leading-none tracking-[0.06em] lg:px-2 lg:text-[8px] ${
                coupon.eligible
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-black/5 text-black/50"
              }`}
            >
              {coupon.message}
            </span>
          </div>

          <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-black/55 lg:text-[10px]">
            {coupon.description}
          </p>
        </div>

        <div className="min-h-[44px] shrink-0 border-l border-black/10 pl-3 text-right lg:min-h-[40px] lg:pl-2.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-black/40 lg:text-[7px]">
            Best price
          </p>

          {coupon.eligible && coupon.discount > 0 ? (
            <>
              <p className="mt-1 text-[17px] font-extrabold leading-none text-black lg:text-[15px]">
                ₹{money(coupon.bestPrice)}
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase text-emerald-700 lg:text-[7px]">
                Save ₹{money(coupon.discount)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-[17px] font-extrabold leading-none text-black/30 lg:text-[15px]">
                —
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase text-black/35 lg:text-[7px]">
                Locked
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => copyCode(coupon.code)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 bg-white transition hover:border-black hover:bg-black hover:text-white active:scale-95 lg:h-7 lg:w-7"
          aria-label={`Copy ${coupon.code}`}
        >
          {copied === coupon.code ? (
            <Check size={13} />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      {coupons.length > 1 && (
        <div className="flex h-9 items-center justify-between border-t border-black/5 px-3.5 lg:h-8 lg:px-3">
          <div className="flex items-center gap-2">
            {coupons.map((item, index) => (
              <button
                key={item._id || item.code}
                type="button"
                onClick={() => setActive(index)}
                className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-all lg:h-2 lg:w-2 ${
                  active === index
                    ? "border-black bg-black"
                    : "border-black/25 bg-white hover:border-black/50"
                }`}
                aria-label={`View ${item.code}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={previous}
              className="grid h-7 w-7 place-items-center rounded-full border border-black/10 bg-white transition hover:border-black hover:bg-black hover:text-white lg:h-6 lg:w-6"
              aria-label="Previous offer"
            >
              <ChevronLeft size={12} />
            </button>

            <button
              type="button"
              onClick={next}
              className="grid h-7 w-7 place-items-center rounded-full border border-black/10 bg-white transition hover:border-black hover:bg-black hover:text-white lg:h-6 lg:w-6"
              aria-label="Next offer"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}