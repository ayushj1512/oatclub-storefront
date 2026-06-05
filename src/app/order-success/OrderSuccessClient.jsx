// src/app/order-success/OrderSuccessClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Mail,
  MapPin,
  Package,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import useGtmStore from "@/store/gtmStore";

const API =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const money = (value, currency = "INR") => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  const formatted = amount.toLocaleString("en-IN");
  return currency === "INR" ? `RS. ${formatted}` : `${formatted} ${currency}`;
};

const sumQty = (items = []) =>
  items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);

const isObjectIdLike = (value) => /^[a-f\d]{24}$/i.test(String(value || "").trim());

const toSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

function Section({ title, Icon, children, className = "" }) {
  return (
    <div className={`border border-neutral-200 bg-white p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          {Icon ? <Icon size={17} className="text-black" /> : null}
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-black">
            {title}
          </h2>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatusRail() {
  const steps = [
    ["CONFIRMED", "ORDER LOCKED"],
    ["PACKED NEXT", "QUALITY CHECK"],
    ["DISPATCH", "TRACKING SOON"],
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {steps.map(([title, desc], index) => (
        <div key={title} className="border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center bg-black text-[10px] font-black text-white">
              {index + 1}
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black">
              {title}
            </p>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-black/45">
            {desc}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderParam = useMemo(() => (searchParams.get("order") || "").trim(), [searchParams]);

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
        if (!orderParam) throw new Error("Missing order reference in URL");

        const path = isObjectIdLike(orderParam)
          ? `/api/orders/${encodeURIComponent(orderParam)}`
          : `/api/orders/by-number/${encodeURIComponent(orderParam)}`;

        const res = await fetch(`${API}${path}`, { cache: "no-store" });
        const data = await safeJson(res);

        if (!res.ok) throw new Error(data?.message || "Failed to load order");
        if (mounted) setOrder(data);
      } catch (error) {
        if (mounted) setErr(error?.message || "Failed to load order");
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
          .map((item) => String(item?.productId?._id || item?.productId || ""))
          .filter(Boolean);

        const results = await Promise.all(
          [...new Set(ids)].map(async (id) => {
            try {
              const res = await fetch(`${API}/api/products/${id}`, {
                cache: "no-store",
              });
              const data = await safeJson(res);
              if (!res.ok) return null;

              const product = data?.product || data?.data || data;
              return product ? { id, product } : null;
            } catch {
              return null;
            }
          })
        );

        const map = {};
        results.filter(Boolean).forEach(({ id, product }) => {
          map[id] = product;
        });

        if (mounted) setProductMap(map);
      } catch (error) {
        console.warn("Product map fetch failed", error);
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
        ? order.items.map((item) => {
            const productId = String(item?.productId?._id || item?.productId || "");
            const product = productMap?.[productId] || {};
            const attrs = Array.isArray(item?.variant?.attributes)
              ? item.variant.attributes
              : [];
            const variantText =
              attrs.map((attr) => attr?.value).filter(Boolean).join(" / ") ||
              item?.variantId ||
              "";

            return {
              productId,
              productCode: product?.productCode || item?.productSnapshot?.productCode || "",
              name: product?.name || product?.title || item?.productSnapshot?.title || "Item",
              price: Number(item?.price || product?.price || 0),
              quantity: Number(item?.quantity || 1),
              category: product?.category?.name || product?.categoryName || "",
              variant: variantText,
              sku: item?.variant?.sku || product?.sku || "",
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
    } catch (error) {
      console.warn("GTM purchase failed", error);
    }
  }, [order, productMap]);

  const onCopy = async () => {
    const text = order?.orderNumber || orderParam;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {}
  };

  const currency = order?.currency || "INR";
  const items = Array.isArray(order?.items) ? order.items : [];
  const shipping = order?.shippingAddressSnapshot || {};
  const qty = sumQty(items);
  const orderEmail =
    shipping?.email ||
    order?.customerId?.email ||
    order?.billingAddressSnapshot?.email ||
    "";
  const orderNumber = order?.orderNumber || orderParam || "PENDING";

  return (
    <section className="min-h-[85vh] bg-[#f7f7f5] text-black">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-8 lg:px-8">
        <div className="border border-neutral-200 bg-white">
          <header className="grid gap-0 border-b border-neutral-200 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="relative overflow-hidden bg-black p-5 text-white sm:p-8 lg:p-10">
              <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(135deg,transparent_0_45%,white_45%_46%,transparent_46%_100%)] [background-size:18px_18px]" />
              <div className="relative max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center border border-white/25 bg-white text-black sm:h-14 sm:w-14">
                    <CheckCircle2 size={30} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
                      ORDER CONFIRMED
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-white/70">
                      THANK YOU FOR SHOPPING OATCLUB
                    </p>
                  </div>
                </div>

                <h1 className="mt-7 max-w-2xl text-3xl font-black uppercase leading-[0.95] tracking-normal text-white sm:text-5xl lg:text-6xl">
                  YOUR EDIT IS LOCKED.
                </h1>
                <p className="mt-4 max-w-xl text-xs font-bold uppercase leading-6 tracking-[0.09em] text-white/62 sm:text-sm">
                  WE ARE QUALITY CHECKING YOUR PIECES, PACKING THEM WITH CARE,
                  AND SENDING TRACKING DETAILS SOON.
                </p>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/all-clothing"
                    className="inline-flex h-11 items-center justify-center gap-2 bg-white px-5 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:bg-neutral-200"
                  >
                    CONTINUE SHOPPING <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/profile/orders"
                    className="inline-flex h-11 items-center justify-center border border-white/25 px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
                  >
                    VIEW ORDERS
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 lg:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
                ORDER REFERENCE
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 border border-neutral-200 bg-neutral-50 p-3">
                <span className="min-w-0 truncate text-lg font-black uppercase tracking-[0.08em] text-black">
                  {orderNumber}
                </span>
                <button
                  type="button"
                  onClick={onCopy}
                  className="grid h-10 w-10 shrink-0 place-items-center border border-neutral-300 bg-white text-black transition hover:border-black"
                  aria-label="Copy order number"
                  title="Copy order number"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="border border-neutral-200 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/42">
                    ITEMS
                  </p>
                  <p className="mt-2 text-2xl font-black leading-none text-black">
                    {qty || 0}
                  </p>
                </div>
                <div className="border border-neutral-200 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/42">
                    PAYABLE
                  </p>
                  <p className="mt-2 text-lg font-black leading-none text-black">
                    {money(order?.finalPayable ?? 0, currency)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-3">
                <Mail size={17} className="mt-0.5 shrink-0 text-black/60" />
                <p className="text-[11px] font-bold uppercase leading-5 tracking-[0.08em] text-black/50">
                  CONFIRMATION SENT TO{" "}
                  <span className="text-black">{orderEmail || "YOUR EMAIL"}</span>
                </p>
              </div>
            </div>
          </header>

          <main className="p-3 sm:p-5 lg:p-7">
            {loading ? (
              <div className="grid min-h-[260px] place-items-center border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                <div>
                  <div className="mx-auto flex w-fit gap-2">
                    <span className="h-3 w-3 animate-bounce bg-black" />
                    <span className="h-3 w-3 animate-bounce bg-black [animation-delay:120ms]" />
                    <span className="h-3 w-3 animate-bounce bg-black [animation-delay:240ms]" />
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-black/45">
                    LOADING YOUR ORDER
                  </p>
                </div>
              </div>
            ) : err ? (
              <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-black uppercase tracking-[0.08em]">COULD NOT LOAD ORDER</div>
                    <div className="mt-1">{err}</div>
                  </div>
                </div>
              </div>
            ) : !order ? (
              <div className="grid min-h-[220px] place-items-center border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-xs font-black uppercase tracking-[0.16em] text-black/45">
                ORDER NOT FOUND.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
                <div className="space-y-4">
                  <StatusRail />

                  <Section title={`ITEMS (${qty} ${qty === 1 ? "ITEM" : "ITEMS"})`} Icon={Package}>
                    <div className="space-y-3">
                      {items.map((item, index) => {
                        const productId = String(item?.productId?._id || item?.productId || "");
                        const product = productMap?.[productId] || {};
                        const title =
                          product?.name ||
                          product?.title ||
                          item?.productSnapshot?.title ||
                          "ITEM";
                        const images = Array.isArray(product?.images) ? product.images : [];
                        const thumb =
                          product?.thumbnail ||
                          images?.[0] ||
                          item?.productSnapshot?.image ||
                          "/placeholder.png";
                        const unit = Number(item?.price || product?.price || 0);
                        const quantity = Number(item?.quantity || 0);
                        const subtotal = Number(item?.subtotal ?? unit * quantity);
                        const attrs = Array.isArray(item?.variant?.attributes)
                          ? item.variant.attributes
                          : [];
                        const attrText = attrs.length
                          ? attrs.map((attr) => `${attr.key}: ${attr.value}`).join(" / ")
                          : "";
                        const category = product?.category?.slug || product?.categorySlug || "all";
                        const productName = product?.slug || toSlug(title);
                        const href = productId
                          ? `/category/${encodeURIComponent(category)}/${encodeURIComponent(productName)}/${encodeURIComponent(productId)}`
                          : "/all-clothing";

                        return (
                          <Link
                            key={`${productId || index}-${index}`}
                            href={href}
                            className="grid gap-3 border border-neutral-200 bg-neutral-50 p-3 transition hover:border-black hover:bg-white sm:grid-cols-[92px_minmax(0,1fr)]"
                          >
                            <div className="aspect-[4/5] w-full bg-white sm:w-[92px]">
                              <img
                                src={thumb}
                                alt={title}
                                className="h-full w-full object-contain p-2"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-black uppercase tracking-[0.08em] text-black">
                                    {title}
                                  </h3>
                                  {attrText ? (
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
                                      {attrText}
                                    </p>
                                  ) : null}
                                  {product?.sku ? (
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/35">
                                      SKU: {product.sku}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/35">
                                    SUBTOTAL
                                  </p>
                                  <p className="mt-1 text-sm font-black text-black">
                                    {money(subtotal, currency)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="border border-neutral-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-black/55">
                                  QTY {quantity}
                                </span>
                                <span className="border border-neutral-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-black/55">
                                  {money(unit, currency)} EACH
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </Section>
                </div>

                <aside className="space-y-4">
                  <Section title="PAYMENT SUMMARY" Icon={ReceiptText}>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold uppercase tracking-[0.08em] text-black/50">SUBTOTAL</span>
                        <span className="font-black text-black">{money(order?.subtotal ?? 0, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold uppercase tracking-[0.08em] text-black/50">SHIPPING</span>
                        <span className="font-black text-black">FREE</span>
                      </div>
                      {(order?.discount ?? 0) > 0 ? (
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold uppercase tracking-[0.08em] text-black/50">DISCOUNT</span>
                          <span className="font-black text-black">- {money(order?.discount ?? 0, currency)}</span>
                        </div>
                      ) : null}
                      <div className="border-t border-neutral-200 pt-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-black uppercase tracking-[0.12em] text-black">TOTAL PAID</span>
                          <span className="text-xl font-black text-black">
                            {money(order?.finalPayable ?? 0, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="SHIPPING ADDRESS" Icon={MapPin}>
                    <div className="text-xs font-bold uppercase leading-6 tracking-[0.08em] text-black/55">
                      <p className="font-black text-black">{shipping?.fullName || "-"}</p>
                      <p>{shipping?.phone || ""}</p>
                      <p>{orderEmail || ""}</p>
                      <p className="mt-2">
                        {[shipping?.line1, shipping?.line2, shipping?.city, shipping?.state, shipping?.country, shipping?.pincode]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </p>
                    </div>
                  </Section>

                  <div className="border border-neutral-200 bg-black p-4 text-white">
                    <div className="flex items-center gap-2">
                      <Truck size={18} />
                      <p className="text-xs font-black uppercase tracking-[0.14em]">
                        WHAT HAPPENS NEXT
                      </p>
                    </div>
                    <p className="mt-3 text-[11px] font-bold uppercase leading-5 tracking-[0.08em] text-white/62">
                      WE AIM TO SHIP WITHIN 7 DAYS. TRACKING DETAILS WILL LAND
                      IN YOUR INBOX ONCE YOUR PIECES MOVE.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </main>

          <footer className="border-t border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-7">
            <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-black/45 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={14} />
                QUALITY CHECKED PIECES
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} />
                PACKED WITH CARE
              </span>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
