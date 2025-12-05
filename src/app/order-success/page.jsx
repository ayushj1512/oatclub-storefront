// src/app/order-success/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Package,
  ReceiptText,
  MapPin,
  AlertTriangle,
  Mail,
} from "lucide-react";

const BRAND = "#800020";
const API =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

/* ---------------- helpers ---------------- */
const safeJson = async (r) => {
  try {
    return await r.json();
  } catch {
    return null;
  }
};

const money = (n, cur = "INR") => {
  const x = Number(n);
  const v = Number.isFinite(x) ? x : 0;
  const s = v.toLocaleString("en-IN");
  return cur === "INR" ? `₹${s}` : `${s} ${cur}`;
};

const sumQty = (items = []) =>
  (items || []).reduce((s, it) => s + Number(it?.quantity || 0), 0);

// Supports both: Mongo ObjectId (24 hex) OR "MIRAY-000005"
const isObjectIdLike = (v) => /^[a-f\d]{24}$/i.test(String(v || "").trim());

const Section = ({ title, Icon, children }) => (
  <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      {Icon ? <Icon className="w-4 h-4" /> : null}
      <span>{title}</span>
    </div>
    <div className="mt-3">{children}</div>
  </div>
);

export default function OrderSuccessPage() {
  const sp = useSearchParams();
  const orderParam = useMemo(() => (sp.get("order") || "").trim(), [sp]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");
      setOrder(null);

      try {
        if (!API)
          throw new Error(
            "NEXT_PUBLIC_BACKEND_URL (or NEXT_PUBLIC_API_URL) missing"
          );
        if (!orderParam) throw new Error("Missing ?order= in URL");

        // If user comes with MIRAY-000005 -> /by-number/:orderNumber
        // If user comes with MongoId -> /:id
        const path = isObjectIdLike(orderParam)
          ? `/api/orders/${encodeURIComponent(orderParam)}`
          : `/api/orders/by-number/${encodeURIComponent(orderParam)}`;

        const res = await fetch(`${API}${path}`, { cache: "no-store" });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Failed to load order");

        if (mounted) setOrder(data);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderParam]);

  const onCopy = async () => {
    const txt = order?.orderNumber || orderParam;
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {}
  };

  const cur = order?.currency || "INR";
  const items = Array.isArray(order?.items) ? order.items : [];
  const ship = order?.shippingAddressSnapshot || {};
  const qty = sumQty(items);

  const orderEmail =
    ship?.email ||
    order?.customerId?.email ||
    order?.billingAddressSnapshot?.email ||
    "";

  return (
    <section className="min-h-[85vh] bg-[#F6F6F8]">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-7 sm:py-10">
        <div className="w-full rounded-[22px] overflow-hidden border border-black/5 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)] os-fade">
          {/* ✅ Burgundy header + highlighted tick */}
          <header className="relative w-full px-4 sm:px-7 py-6 sm:py-9" style={{ backgroundColor: BRAND }}>
            <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_30%,white_0,transparent_42%)]" />
            <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
              <div className="grid place-items-center rounded-3xl border border-white/25 bg-white/15 shadow-[0_22px_60px_rgba(0,0,0,0.22)] os-pop size-14 sm:size-18">
                <div className="grid place-items-center rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.20)] size-11 sm:size-14">
                  <CheckCircle2 className="w-7 h-7 sm:w-9 sm:h-9" style={{ color: BRAND }} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] sm:text-xs tracking-wide text-white/80">Order Confirmed</p>
                <h1 className="text-xl sm:text-3xl font-semibold text-white">Thank you — your order is placed</h1>
                <p className="text-xs sm:text-base text-white/85">We’ll share updates on WhatsApp / Email.</p>
              </div>

              <div className="mt-1 sm:mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-white/80">Order:</span>

                <span className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold tabular-nums border border-white/25 bg-white/12 text-white">
                  {order?.orderNumber || orderParam || "—"}
                </span>

                <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border border-white/25 bg-white/10 text-white hover:bg-white/15 active:scale-[0.99] transition">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* ✅ Email confirmation note */}
              <div className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] sm:text-xs text-white/90">
                <Mail className="w-4 h-4" />
                <span className="font-medium">
                  Order confirmation sent to{" "}
                  <span className="font-semibold text-white">{orderEmail || "your email"}</span>
                </span>
              </div>

              <div className="mt-1 text-[11px] text-white/80">
                Status:{" "}
                <span className="font-semibold text-white">
                  {String(order?.fulfillmentStatus || "processing").replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </header>

          {/* Body (horizontal layout) */}
          <div className="p-4 sm:p-7">
            {loading ? (
              <div className="text-center text-gray-500 text-sm py-10">
                Loading your order…
              </div>
            ) : err ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-semibold">Couldn’t load order</div>
                    <div className="mt-1">{err}</div>
                    <div className="mt-3 text-xs text-red-600">
                      Tip: This page supports both{" "}
                      <span className="font-mono">?order=&lt;mongo_id&gt;</span>{" "}
                      and <span className="font-mono">?order=MIRAY-000005</span>{" "}
                      (via <span className="font-mono">/api/orders/by-number</span>).
                    </div>
                  </div>
                </div>
              </div>
            ) : !order ? (
              <div className="text-center text-gray-500 text-sm py-10">
                Order not found.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                {/* Left: Items */}
                <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                  <Section title={`Items (${qty} ${qty === 1 ? "item" : "items"})`} Icon={Package}>
                    <div className="space-y-3">
                      {items.map((it, idx) => {
                        const snap = it?.productSnapshot || {};
                        const v = it?.variant || {};
                        const title = snap?.title || "Item";
                        const thumb =
                          v?.image ||
                          snap?.thumbnail ||
                          (Array.isArray(snap?.images) ? snap.images[0] : "") ||
                          "";
                        const attrs = Array.isArray(v?.attributes) ? v.attributes : [];
                        const attrText = attrs.length ? attrs.map((a) => `${a.key}: ${a.value}`).join(" • ") : "";
                        const unit = Number(it?.price || 0);
                        const q = Number(it?.quantity || 0);
                        const sub = Number(it?.subtotal ?? unit * q);

                        return (
                          <div key={`${String(it?.productId || idx)}-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-black/10 bg-white p-3 sm:p-4 hover:bg-black/[0.01] transition">
                            {/* ✅ photo: contain (not cover) */}
                            <div className="w-full sm:w-[92px] h-[116px] sm:h-[120px] rounded-2xl overflow-hidden bg-black/[0.03] border border-black/5 shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={title} className="w-full h-full object-contain p-2" />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-[11px] text-gray-500">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{title}</div>
                                  {attrText ? <div className="mt-1 text-xs text-gray-600">{attrText}</div> : null}
                                  {v?.sku || snap?.sku ? <div className="mt-1 text-[11px] text-gray-500">SKU: {v?.sku || snap?.sku}</div> : null}
                                </div>

                                <div className="text-right">
                                  <div className="text-[11px] text-gray-500">Subtotal</div>
                                  <div className="text-sm sm:text-base font-semibold tabular-nums" style={{ color: BRAND }}>
                                    {money(sub, cur)}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-[11px] px-2 py-1 rounded-xl bg-black/[0.04] border border-black/5 text-gray-700">Qty: {q}</span>
                                <span className="text-[11px] px-2 py-1 rounded-xl bg-black/[0.04] border border-black/5 text-gray-700">{money(unit, cur)} each</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Section>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/shop" className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold border border-black/10 bg-white hover:bg-black/[0.02] transition">
                      Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link href="/orders" className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold text-white active:scale-[0.99] transition" style={{ backgroundColor: BRAND }}>
                      View Orders
                    </Link>
                  </div>
                </div>

                {/* Right: Summary + Address */}
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                  <Section title="Payment Summary" Icon={ReceiptText}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold tabular-nums text-gray-900">{money(order?.subtotal ?? 0, cur)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-semibold tabular-nums text-gray-900">{money(order?.shippingFee ?? 0, cur)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-semibold tabular-nums text-gray-900">{money(order?.tax ?? 0, cur)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-semibold tabular-nums text-gray-900">{`- ${money(order?.discount ?? 0, cur)}`}</span>
                      </div>
                      <div className="h-px bg-black/5 my-2" />
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-900">Payable</span>
                        <span className="text-lg font-semibold tabular-nums" style={{ color: BRAND }}>
                          {money(order?.finalPayable ?? 0, cur)}
                        </span>
                      </div>

                      <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.02] p-3 text-xs text-gray-700">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-600">Payment</span>
                          <span className="font-semibold text-gray-900">
                            {String(order?.paymentMethod || "cod").toUpperCase()} • {String(order?.paymentStatus || "pending").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Shipping Address" Icon={MapPin}>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <div className="font-semibold text-gray-900">{ship?.fullName || "—"}</div>
                      <div className="mt-1">{[ship?.phone ? `📞 ${ship.phone}` : "", orderEmail ? `✉️ ${orderEmail}` : ""].filter(Boolean).join(" • ")}</div>
                      <div className="mt-2">{[ship?.line1, ship?.line2, ship?.city, ship?.state, ship?.country, ship?.pincode].filter(Boolean).join(", ") || "—"}</div>
                    </div>
                  </Section>
                </div>
              </div>
            )}
          </div>

          {/* Minimal footer */}
          <div className="px-4 sm:px-7 py-4 border-t border-black/5 bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
              <div className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: "rgba(128,0,32,0.45)" }} />
                Packed with care
              </div>
              <div className="text-[11px]">
                Uses: <span className="font-mono">/api/orders/:id</span> or{" "}
                <span className="font-mono">/api/orders/by-number/:orderNumber</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ tiny luxury animation only */}
      <style jsx global>{`
        .os-fade{animation:osFade 520ms ease-out both}
        .os-pop{animation:osPop 1.6s ease-in-out infinite}
        @keyframes osFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes osPop{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @media (prefers-reduced-motion: reduce){.os-fade,.os-pop{animation:none!important}}
      `}</style>
    </section>
  );
}
