// src/app/order-success/OrderSuccessClient.jsx
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
import useGtmStore from "@/store/gtmStore";

const BRAND = "#16a34a";
const API =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

const safeJson = async (r) => {
  try {
    return await r.json();
  } catch {
    return null;
  }
};

const money = (n, cur = "INR") => {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;
  const s = v.toLocaleString("en-IN");
  return cur === "INR" ? `₹${s}` : `${s} ${cur}`;
};

const sumQty = (items = []) =>
  items.reduce((s, it) => s + Number(it?.quantity || 0), 0);

const isObjectIdLike = (v) => /^[a-f\d]{24}$/i.test(String(v || "").trim());

const toSlug = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const Section = ({ title, Icon, children }) => (
  <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      {Icon ? <Icon className="w-4 h-4" /> : null}
      <span>{title}</span>
    </div>
    <div className="mt-3">{children}</div>
  </div>
);

export default function OrderSuccessClient() {
  const sp = useSearchParams();
  const orderParam = useMemo(() => (sp.get("order") || "").trim(), [sp]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");
      setOrder(null);

      try {
        if (!API) throw new Error("NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_API_URL missing");
        if (!orderParam) throw new Error("Missing ?order= in URL");

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!order?.items?.length || !API) return;

        const ids = order.items
          .map((it) => String(it?.productId?._id || it?.productId || ""))
          .filter(Boolean);

        const results = await Promise.all(
          [...new Set(ids)].map(async (id) => {
            try {
              const r = await fetch(`${API}/api/products/${id}`, {
                cache: "no-store",
              });
              const j = await safeJson(r);
              if (!r.ok) return null;

              const prod = j?.product || j?.data || j;
              return prod ? { id, prod } : null;
            } catch {
              return null;
            }
          })
        );

        const map = {};
        results.filter(Boolean).forEach(({ id, prod }) => {
          map[id] = prod;
        });

        if (mounted) setProductMap(map);
      } catch (e) {
        console.warn("❌ productMap fetch failed", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [order]);

  useEffect(() => {
    if (!order?.orderNumber && !order?._id) return;

    const transactionId = order?.orderNumber || order?._id;
    const storageKey = `gtm_purchase_${transactionId}`;

    try {
      if (localStorage.getItem(storageKey)) return;

      const orderItems = Array.isArray(order?.items)
        ? order.items.map((it) => {
            const pid = String(it?.productId?._id || it?.productId || "");
            const prod = productMap?.[pid] || {};
            const attrs = Array.isArray(it?.variant?.attributes)
              ? it.variant.attributes
              : [];

            const variantText =
              attrs.map((a) => a?.value).filter(Boolean).join(" / ") ||
              it?.variantId ||
              "";

            return {
              productId: pid,
              productCode: prod?.productCode || it?.productSnapshot?.productCode || "",
              name: prod?.name || prod?.title || it?.productSnapshot?.title || "Item",
              price: Number(it?.price || prod?.price || 0),
              quantity: Number(it?.quantity || 1),
              category: prod?.category?.name || prod?.categoryName || "",
              variant: variantText,
              sku: it?.variant?.sku || prod?.sku || "",
            };
          })
        : [];

      useGtmStore.getState().purchase({
        order: {
          _id: order?._id,
          orderNumber: transactionId,
          totalAmount: Number(order?.finalPayable ?? order?.payable ?? order?.subtotal ?? 0),
          taxAmount: Number(order?.taxAmount || 0),
          shippingAmount: Number(order?.shippingAmount || 0),
          couponCode: order?.coupon?.code || order?.couponCode || "",
          paymentMethod: order?.paymentMethod || "",
        },
        items: orderItems,
      });

      localStorage.setItem(storageKey, "1");
    } catch (e) {
      console.warn("📈 GTM purchase failed", e);
    }
  }, [order, productMap]);

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
          <header
            className="relative w-full px-4 sm:px-7 py-6 sm:py-9"
            style={{ backgroundColor: BRAND }}
          >
            <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_30%,white_0,transparent_42%)]" />

            <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
              <div className="grid place-items-center rounded-3xl border border-white/25 bg-white/15 shadow-[0_22px_60px_rgba(0,0,0,0.22)] os-pop size-14 sm:size-18">
                <div className="grid place-items-center rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.20)] size-11 sm:size-14">
                  <CheckCircle2
                    className="w-7 h-7 sm:w-9 sm:h-9"
                    style={{ color: BRAND }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] sm:text-xs tracking-wide text-white/80">
                  Order Confirmed
                </p>
                <h1 className="text-xl sm:text-3xl font-semibold text-white">
                  Thank you — your order is placed
                </h1>
                <p className="text-xs sm:text-base text-white/85">
                  We’ll share updates on WhatsApp / Email.
                </p>
              </div>

              <div className="mt-1 sm:mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-white/80">
                  Order:
                </span>

                <span className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold tabular-nums border border-white/25 bg-white/12 text-white">
                  {order?.orderNumber || orderParam || "—"}
                </span>

                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border border-white/25 bg-white/10 text-white hover:bg-white/15 active:scale-[0.99] transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] sm:text-xs text-white/90">
                <Mail className="w-4 h-4" />
                <span className="font-medium">
                  Order confirmation sent to{" "}
                  <span className="font-semibold text-white">
                    {orderEmail || "your email"}
                  </span>
                </span>
              </div>
            </div>
          </header>

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
                  </div>
                </div>
              </div>
            ) : !order ? (
              <div className="text-center text-gray-500 text-sm py-10">
                Order not found.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                  <Section title={`Items (${qty} ${qty === 1 ? "item" : "items"})`} Icon={Package}>
                    <div className="space-y-3">
                      {items.map((it, idx) => {
                        const pid = String(it?.productId?._id || it?.productId || "");
                        const prod = productMap?.[pid] || {};

                        const title = prod?.name || prod?.title || "Item";
                        const images = Array.isArray(prod?.images) ? prod.images : [];
                        const thumb = prod?.thumbnail || images?.[0] || "/placeholder.png";

                        const unit = Number(it?.price || prod?.price || 0);
                        const q = Number(it?.quantity || 0);
                        const sub = Number(it?.subtotal ?? unit * q);

                        const attrs = Array.isArray(it?.variant?.attributes)
                          ? it.variant.attributes
                          : [];

                        const attrText = attrs.length
                          ? attrs.map((a) => `${a.key}: ${a.value}`).join(" • ")
                          : "";

                        const category = prod?.category?.slug || prod?.categorySlug || "all";
                        const productName = prod?.slug || toSlug(title);
                        const href = `/category/${encodeURIComponent(category)}/${encodeURIComponent(
                          productName
                        )}/${encodeURIComponent(pid)}`;

                        return (
                          <Link key={`${pid || idx}-${idx}`} href={href} className="block">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-black/10 bg-white p-3 sm:p-4 hover:bg-black/[0.02] transition cursor-pointer">
                              <div className="w-full sm:w-[92px] h-[116px] sm:h-[120px] rounded-2xl overflow-hidden bg-black/[0.03] border border-black/5 shrink-0">
                                <img
                                  src={thumb}
                                  alt={title}
                                  className="w-full h-full object-contain p-2"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                      {title}
                                    </div>

                                    {attrText ? (
                                      <div className="mt-1 text-xs text-gray-600">
                                        {attrText}
                                      </div>
                                    ) : null}

                                    {prod?.sku ? (
                                      <div className="mt-1 text-[11px] text-gray-500">
                                        SKU: {prod.sku}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="text-right">
                                    <div className="text-[11px] text-gray-500">
                                      Subtotal
                                    </div>
                                    <div
                                      className="text-sm sm:text-base font-semibold tabular-nums"
                                      style={{ color: BRAND }}
                                    >
                                      {money(sub, cur)}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="text-[11px] px-2 py-1 rounded-xl bg-black/4 border border-black/5 text-gray-700">
                                    Qty: {q}
                                  </span>
                                  <span className="text-[11px] px-2 py-1 rounded-xl bg-black/4 border border-black/5 text-gray-700">
                                    {money(unit, cur)} each
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </Section>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/shop"
                      className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold border border-black/10 bg-white hover:bg-black/[0.02] transition"
                    >
                      Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>

                    <Link
                      href="/profile/orders"
                      className="flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold text-white active:scale-[0.99] transition"
                      style={{ backgroundColor: BRAND }}
                    >
                      View Orders
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                  <Section title="Payment Summary" Icon={ReceiptText}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold tabular-nums text-gray-900">
                          {money(order?.subtotal ?? 0, cur)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-semibold tabular-nums text-green-700">
                          FREE
                        </span>
                      </div>

                      {(order?.discount ?? 0) > 0 && (
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-semibold tabular-nums text-gray-900">
                            - {money(order?.discount ?? 0, cur)}
                          </span>
                        </div>
                      )}

                      <div className="h-px bg-black/5 my-2" />

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-900">
                          Payable
                        </span>
                        <span
                          className="text-lg font-semibold tabular-nums"
                          style={{ color: BRAND }}
                        >
                          {money(order?.finalPayable ?? 0, cur)}
                        </span>
                      </div>
                    </div>
                  </Section>

                  <Section title="Shipping Address" Icon={MapPin}>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <div className="font-semibold text-gray-900">
                        {ship?.fullName || "—"}
                      </div>

                      <div className="mt-1">
                        {[ship?.phone ? `📞 ${ship.phone}` : "", orderEmail ? `✉️ ${orderEmail}` : ""]
                          .filter(Boolean)
                          .join(" • ")}
                      </div>

                      <div className="mt-2">
                        {[ship?.line1, ship?.line2, ship?.city, ship?.state, ship?.country, ship?.pincode]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </div>
                    </div>
                  </Section>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-7 py-4 border-t border-black/5 bg-white">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="size-2 rounded-full bg-black/30" />
              Packed with care
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}