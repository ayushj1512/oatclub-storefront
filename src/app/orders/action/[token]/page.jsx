"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  PackageX,
  Phone,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import { useOrderStore } from "@/store/orderStore";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

const SUPPORT_NUMBER = "917217649990";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
};

const formatPaymentMethod = (method) => {
  const value = String(method || "").toLowerCase();

  if (value === "cod") return "Cash on Delivery";
  if (value === "razorpay") return "Online Payment";
  if (value === "wallet") return "Wallet";

  return method || "—";
};

const getAddress = (address = {}) =>
  [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

const createSupportUrl = (orderNumber, state = "") => {
  const message = [
    "Hi OATCLUB Support,",
    "",
    `I need help with my order #${orderNumber || ""}.`,
    state ? `Current status: ${state}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`;
};

export default function OrderActionPage() {
  const { token } = useParams();

  const runningRef = useRef(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(null);
  const [localError, setLocalError] = useState("");

  const {
    actionOrder: order,
    actionLoading,
    actionError,
    fetchOrderByActionToken,
    confirmOrderByActionToken,
    cancelOrder,
    clearActionOrder,
  } = useOrderStore();

  useEffect(() => {
    if (!token) return;

    fetchOrderByActionToken(token);

    return () => clearActionOrder?.();
  }, [token, fetchOrderByActionToken, clearActionOrder]);

  const status = String(order?.fulfillmentStatus || "").toLowerCase();

  const isConfirmed = Boolean(order?.isConfirmed);

  const isCancelled =
    status === "cancelled" || Boolean(order?.cancellation?.isCancelled);

  const canCancel = ["processing", "packed"].includes(status);

  const view = useMemo(() => {
    if (justCompleted) return justCompleted;
    if (isCancelled) return "cancelled";
    if (isConfirmed) return "confirmed";

    return "pending";
  }, [justCompleted, isConfirmed, isCancelled]);

  const refetch = async () => {
    if (token) {
      await fetchOrderByActionToken(token);
    }
  };

  const handleConfirm = async () => {
    if (runningRef.current) return;

    try {
      runningRef.current = true;
      setSubmitting(true);
      setLocalError("");

      await confirmOrderByActionToken();

      setJustCompleted("confirmed");
    } catch (error) {
      setLocalError(error?.message || "Unable to confirm order.");
      await refetch();
    } finally {
      runningRef.current = false;
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async (reasonText = "") => {
    if (runningRef.current) return;

    try {
      if (!order?._id) {
        throw new Error("Order not found.");
      }

      runningRef.current = true;
      setSubmitting(true);
      setLocalError("");

      await cancelOrder(order._id, reasonText);

      setCancelOpen(false);
      setJustCompleted("cancelled");
    } catch (error) {
      setLocalError(
        error?.message || "Unable to cancel the order. Please try again.",
      );

      await refetch();
    } finally {
      runningRef.current = false;
      setSubmitting(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (actionLoading && !order) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#f5f5f3]">
        <div className="flex flex-col items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-950" />
          </div>

          <p className="text-xs font-medium text-neutral-500">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (actionError && !order) {
    return (
      <StatePage
        type="error"
        title="We couldn't find this order"
        description={
          actionError ||
          "This order link may be invalid or no longer available."
        }
        supportUrl={createSupportUrl("", "Order link issue")}
      />
    );
  }

  /* =========================
     CONFIRMED
  ========================= */

  if (view === "confirmed") {
    return (
      <CompletedOrderPage
        order={order}
        type="confirmed"
        title="Your order is confirmed"
        description="Thank you for confirming your order. We're preparing it for the next stage."
      />
    );
  }

  /* =========================
     CANCELLED
  ========================= */

  if (view === "cancelled") {
    return (
      <CompletedOrderPage
        order={order}
        type="cancelled"
        title="Your order is cancelled"
        description="This order has already been cancelled. If you need assistance, our support team can help."
      />
    );
  }

  /* =========================
     PENDING ACTION
  ========================= */

  return (
    <main className="min-h-[100dvh] bg-[#f5f5f3] text-neutral-950">
      <div className="mx-auto w-full max-w-3xl px-2.5 py-2.5 sm:px-5 sm:py-5">
        <div className="overflow-hidden rounded-[22px] border border-neutral-200/80 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
          <OrderHeader
            orderNumber={order?.orderNumber}
            orderDate={order?.orderDate || order?.createdAt}
          />

          <div className="p-3 sm:p-5">
            {localError ? (
              <div className="mb-3 flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                <div>
                  <p className="text-xs font-semibold text-red-900">
                    Something went wrong
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-red-700">
                    {localError}
                  </p>
                </div>
              </div>
            ) : null}

            {/* ACTION NOTICE */}

            <div className="mb-4 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3">
              <div className="flex gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100">
                  <CircleHelp className="h-4 w-4 text-amber-700" />
                </div>

                <div>
                  <h2 className="text-xs font-bold text-neutral-950">
                    We need your confirmation
                  </h2>

                  <p className="mt-0.5 text-[11px] leading-4 text-neutral-600 sm:text-xs">
                    Review your order and confirm if you'd like us to proceed.
                  </p>
                </div>
              </div>
            </div>

            {/* PRODUCTS */}

            <SectionHeader
              icon={ShoppingBag}
              title="Your order"
              value={`${order?.items?.length || 0} ${order?.items?.length === 1 ? "item" : "items"
                }`}
            />

            <div className="mt-2 space-y-1.5">
              {(order?.items || []).map((item) => (
                <ProductCard
                  key={item?.lineId || item?._id}
                  item={item}
                />
              ))}
            </div>

            {/* DETAILS */}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <CustomerCard order={order} />
              <PaymentCard order={order} />
            </div>

            {/* PRICE */}

            <div className="mt-2">
              <PriceSummary order={order} />
            </div>

            {/* TRUST */}

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <TrustItem
                icon={ShieldCheck}
                title="Secure"
                text="Confirmation"
              />

              <TrustItem
                icon={PackageCheck}
                title="Checked"
                text="Before dispatch"
              />

              <TrustItem
                icon={Truck}
                title="Tracked"
                text="After shipping"
              />
            </div>

            {/* ACTIONS */}

            <div className="mt-4 border-t border-neutral-100 pt-3">
              <p className="mb-2 text-center text-[10px] text-neutral-400">
                Choose one option below
              </p>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={actionLoading || submitting}
                className="group flex h-12 w-full items-center justify-between rounded-xl bg-neutral-950 px-3.5 text-left text-white transition hover:bg-black active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                    {actionLoading || submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <div>
                    <p className="text-[13px] font-bold">
                      Confirm my order
                    </p>

                    <p className="text-[9px] text-white/55 sm:text-[10px]">
                      Yes, proceed with my order
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={!canCancel || actionLoading || submitting}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-[13px] font-bold text-white transition hover:bg-red-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40"
              >
                <PackageX className="h-4 w-4" />
                Cancel this order
              </button>

              {!canCancel ? (
                <p className="mt-2 text-center text-[10px] leading-4 text-neutral-400">
                  Online cancellation is unavailable. Please contact support.
                </p>
              ) : null}
            </div>

            {/* SUPPORT */}

            <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-center">
              <p className="text-[11px] font-semibold text-neutral-900">
                Need help before deciding?
              </p>

              <a
                href={createSupportUrl(order?.orderNumber)}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-950"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Chat with OATCLUB Support
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <p className="px-4 py-3 text-center text-[9px] text-neutral-400">
          OATCLUB · Own All Trends
        </p>
      </div>

      <CancelOrderModal
        open={cancelOpen}
        order={order}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        loading={submitting}
      />
    </main>
  );
}

/* =========================================================
   HEADER
========================================================= */

function OrderHeader({ orderNumber, orderDate }) {
  return (
    <div className="relative overflow-hidden bg-neutral-950 px-4 py-4 text-white sm:px-6 sm:py-5">
      <div className="absolute -right-12 -top-20 h-36 w-36 rounded-full bg-white/[0.04]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/80">
              Action Required
            </span>
          </div>

          <p className="text-[10px] font-medium text-white/50">
            #{orderNumber || "—"}
          </p>
        </div>

        <h1 className="mt-3 max-w-md text-[22px] font-black leading-tight tracking-[-0.035em] sm:text-[28px]">
          Confirm your OATCLUB order.
        </h1>

        <p className="mt-1 text-[12px] leading-5 text-white/60 sm:text-[13px]">
          Review your items and delivery details before we process your order.
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/45">
          <CalendarDays className="h-3 w-3" />
          Ordered {formatDate(orderDate)}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT
========================================================= */

function ProductCard({ item }) {
  const snapshot = item?.productSnapshot || {};

  return (
    <div className="flex gap-2.5 rounded-xl border border-neutral-100 bg-[#fafafa] p-2.5">
      <div className="h-[72px] w-[58px] shrink-0 overflow-hidden rounded-xl bg-white">
        <img
          src={snapshot?.thumbnail || "/placeholder.png"}
          alt={snapshot?.title || "Product"}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {snapshot?.productCode ? (
              <p className="mb-0.5 text-[8px] font-bold uppercase tracking-wider text-neutral-400">
                {snapshot.productCode}
              </p>
            ) : null}

            <p className="line-clamp-2 text-[12px] font-semibold leading-4 text-neutral-950 sm:text-[13px]">
              {snapshot?.title || "Product"}
            </p>
          </div>

          <p className="shrink-0 text-[12px] font-bold text-neutral-950">
            {money(item?.subtotal)}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {item?.selectedSize ? (
            <ProductTag>Size {item.selectedSize}</ProductTag>
          ) : null}

          {item?.selectedColor ? (
            <ProductTag>{item.selectedColor}</ProductTag>
          ) : null}

          <ProductTag>Qty {item?.quantity || 1}</ProductTag>
        </div>
      </div>
    </div>
  );
}

function ProductTag({ children }) {
  return (
    <span className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-neutral-600">
      {children}
    </span>
  );
}

/* =========================================================
   CUSTOMER
========================================================= */

function CustomerCard({ order }) {
  const address = order?.shippingAddressSnapshot || {};

  return (
    <DetailCard
      icon={MapPin}
      title="Delivery details"
    >
      <DetailRow
        icon={User}
        label="Name"
        value={address?.fullName}
      />

      <DetailRow
        icon={Phone}
        label="Phone"
        value={address?.phone}
      />

      <div className="mt-2 border-t border-neutral-100 pt-2">
        <p className="text-[9px] font-medium text-neutral-400">
          Delivery address
        </p>

        <p className="mt-0.5 text-[10px] font-medium leading-4 text-neutral-700 sm:text-[11px]">
          {getAddress(address) || "—"}
        </p>
      </div>
    </DetailCard>
  );
}

/* =========================================================
   PAYMENT
========================================================= */

function PaymentCard({ order }) {
  const isCOD =
    String(order?.paymentMethod || "").toLowerCase() === "cod";

  return (
    <DetailCard
      icon={CreditCard}
      title="Payment"
    >
      <DetailRow
        label="Method"
        value={formatPaymentMethod(order?.paymentMethod)}
      />

      <DetailRow
        label="Payment"
        value={
          isCOD
            ? "Pay on delivery"
            : String(order?.paymentStatus || "—")
              .replaceAll("_", " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
        }
      />

      <DetailRow
        label="Status"
        value={String(order?.fulfillmentStatus || "Processing")
          .replaceAll("_", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())}
      />

      <div className="mt-2 rounded-lg bg-neutral-50 px-2.5 py-2">
        <p className="text-[9px] leading-4 text-neutral-500">
          {isCOD
            ? "Pay the amount when your order is delivered."
            : "Your payment is securely linked with this order."}
        </p>
      </div>
    </DetailCard>
  );
}

/* =========================================================
   PRICE
========================================================= */

function PriceSummary({ order }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-1.5">
        <ReceiptText className="h-3.5 w-3.5 text-neutral-500" />

        <h3 className="text-xs font-bold text-neutral-950">
          Price summary
        </h3>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <PriceRow
          label="Subtotal"
          value={money(order?.subtotal)}
        />

        {Number(order?.discount || 0) > 0 ? (
          <PriceRow
            label="Discount"
            value={`-${money(order.discount)}`}
          />
        ) : null}

        <PriceRow
          label="Shipping"
          value={
            Number(order?.shippingFee || 0) > 0
              ? money(order.shippingFee)
              : "FREE"
          }
        />

        {Number(order?.tax || 0) > 0 ? (
          <PriceRow
            label="Taxes"
            value={money(order.tax)}
          />
        ) : null}
      </div>

      <div className="my-2.5 border-t border-dashed border-neutral-200" />

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-neutral-950">
            Amount payable
          </p>

          <p className="text-[8px] text-neutral-400">
            Inclusive of applicable charges
          </p>
        </div>

        <p className="text-lg font-black tracking-tight text-neutral-950">
          {money(order?.finalPayable)}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COMPLETED PAGE
========================================================= */

function CompletedOrderPage({
  order,
  type,
  title,
  description,
}) {
  const confirmed = type === "confirmed";

  const supportUrl = createSupportUrl(
    order?.orderNumber,
    confirmed ? "Confirmed" : "Cancelled",
  );

  return (
    <main className="min-h-[100dvh] bg-[#f5f5f3] px-2.5 py-3 sm:px-5 sm:py-6">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
        <div className="p-4 text-center sm:p-5">
          <div
            className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${confirmed
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
              }`}
          >
            {confirmed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </div>

          <div
            className={`mx-auto mt-2.5 w-fit rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${confirmed
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
              }`}
          >
            {confirmed ? "Confirmed" : "Cancelled"}
          </div>

          <p className="mt-2 text-[9px] font-semibold text-neutral-400">
            ORDER #{order?.orderNumber || "—"} · {(order?.items || []).reduce((sum, item) => sum + Number(item?.quantity || 1), 0)} ITEM{(order?.items || []).reduce((sum, item) => sum + Number(item?.quantity || 1), 0) === 1 ? "" : "S"}
          </p>

          <h1 className="mt-1 text-xl font-black tracking-tight text-neutral-950">
            {title}
          </h1>

          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-4 text-neutral-500">
            {description}
          </p>
        </div>

        <div className="border-t border-neutral-100 px-3 py-3 sm:px-5">
          <div className="space-y-1.5">
            {(order?.items || []).map((item) => (
              <ProductCard
                key={item?.lineId || item?._id}
                item={item}
              />
            ))}
          </div>

          <div className="mt-2 rounded-xl bg-neutral-50 p-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-neutral-500">
                Subtotal
              </span>

              <span className="text-[10px] font-bold text-neutral-800">
                {money(order?.subtotal)}
              </span>
            </div>

            {Number(order?.discount || 0) > 0 ? (
              <div className="mt-1.5 flex items-center justify-between gap-4">
                <span className="text-[10px] text-neutral-500">
                  Discount
                </span>

                <span className="text-[10px] font-bold text-neutral-800">
                  -{money(order?.discount)}
                </span>
              </div>
            ) : null}

            <div className="mt-1.5 flex items-center justify-between gap-4">
              <span className="text-[10px] text-neutral-500">
                Shipping
              </span>

              <span className="text-[10px] font-bold text-neutral-800">
                {Number(order?.shippingFee || 0) > 0 ? money(order?.shippingFee) : "FREE"}
              </span>
            </div>

            <div className="mt-2 border-t border-neutral-200 pt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-semibold text-neutral-700">
                  Payable amount
                </span>

                <span className="text-sm font-black text-neutral-950">
                  {money(order?.finalPayable)}
                </span>
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-4">
              <span className="text-[10px] text-neutral-500">
                Payment
              </span>

              <span className="text-[10px] font-bold text-neutral-800">
                {formatPaymentMethod(order?.paymentMethod)}
              </span>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-neutral-500" />
              <p className="text-[10px] font-bold text-neutral-950">
                Delivery details
              </p>
            </div>

            <p className="mt-2 text-[10px] font-semibold text-neutral-800">
              {order?.shippingAddressSnapshot?.fullName || "—"}
            </p>
            <p className="mt-0.5 text-[9px] text-neutral-500">
              {order?.shippingAddressSnapshot?.phone || ""}
            </p>
            <p className="mt-1 text-[9px] leading-4 text-neutral-500">
              {getAddress(order?.shippingAddressSnapshot || {}) || "—"}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-neutral-200 p-3">
            <p className="text-center text-[11px] font-bold text-neutral-950">
              Need help with this order?
            </p>

            <a
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-[12px] font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>

            <a
              href="/"
              className="mt-1.5 flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-[12px] font-bold text-white"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   ERROR PAGE
========================================================= */

function StatePage({
  type,
  title,
  description,
  supportUrl,
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f5f5f3] px-3 py-5">
      <section className="w-full max-w-sm rounded-[22px] border border-neutral-200 bg-white p-5 text-center shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
          {type === "error" ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <CircleHelp className="h-5 w-5" />
          )}
        </div>

        <h1 className="mt-3 text-lg font-black tracking-tight text-neutral-950">
          {title}
        </h1>

        <p className="mt-1 text-[11px] leading-4 text-neutral-500">
          {description}
        </p>

        <a
          href={supportUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-[12px] font-bold text-white"
        >
          <MessageCircle className="h-4 w-4" />
          Contact Support on WhatsApp
        </a>

        <a
          href="/"
          className="mt-1.5 flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-[12px] font-bold text-white"
        >
          Go to OATCLUB
        </a>
      </section>
    </main>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-neutral-500" />

        <h2 className="text-xs font-bold text-neutral-950">
          {title}
        </h2>
      </div>

      {value ? (
        <span className="text-[10px] font-medium text-neutral-400">
          {value}
        </span>
      ) : null}
    </div>
  );
}

function DetailCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-100">
          <Icon className="h-3.5 w-3.5 text-neutral-700" />
        </div>

        <h3 className="text-xs font-bold text-neutral-950">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <div className="flex items-center gap-1 text-[9px] text-neutral-400">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>

      <p className="max-w-[65%] text-right text-[10px] font-semibold leading-4 text-neutral-800">
        {value || "—"}
      </p>
    </div>
  );
}

function PriceRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-neutral-500">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-neutral-800">
        {value}
      </span>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-lg bg-neutral-50 px-1.5 py-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-neutral-700" />

      <p className="mt-1 text-[9px] font-bold text-neutral-800">
        {title}
      </p>

      <p className="text-[8px] leading-3 text-neutral-400">
        {text}
      </p>
    </div>
  );
}
