"use client";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import useNdrStore from "@/store/ndrStore";

const SUPPORT_NUMBER = "917217649990";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatText = (value) =>
  String(value || "—")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );

const getAddress = (order = {}) =>
  order.shippingAddress ||
  order.shippingAddressSnapshot ||
  {};

const getCustomer = (order = {}) => {
  const address = getAddress(order);

  return {
    name:
      order.customer?.name ||
      address.name ||
      address.fullName ||
      "Customer",

    phone:
      order.customer?.phone ||
      address.phone ||
      "",

    address: [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", "),
  };
};

const getItems = (order = {}) =>
  Array.isArray(order.products)
    ? order.products
    : Array.isArray(order.items)
      ? order.items
      : [];

const supportLink = (orderNumber) => {
  const message = [
    "Hi OATCLUB Support,",
    "",
    `I need help with delivery of order #${orderNumber}.`,
  ].join("\n");

  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(
    message,
  )}`;
};

export default function NdrOrderPage() {
  const params = useParams();

  const orderNumber =
    params?.["order-number"];

  const {
    order,
    result,
    loading,
    submitting,
    error,
    fetchNdrOrder,
    submitNdrAction,
    reset,
  } = useNdrStore();

  const [localError, setLocalError] =
    useState("");

  useEffect(() => {
    if (!orderNumber) return;

    fetchNdrOrder(orderNumber).catch(
      () => {},
    );

    return () => reset();
  }, [
    orderNumber,
    fetchNdrOrder,
    reset,
  ]);

  const handleReattempt = async () => {
    try {
      setLocalError("");

      await submitNdrAction({
        token: orderNumber,
        action: "RE-ATTEMPT",
      });
    } catch (requestError) {
      setLocalError(
        requestError?.message ||
          "Unable to submit reattempt request.",
      );
    }
  };

  if (loading && !order) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#f5f5f3]">
        <div className="text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>

          <p className="mt-3 text-xs font-medium text-neutral-500">
            Loading delivery details...
          </p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <StatePage
        icon={CircleAlert}
        title="Delivery request unavailable"
        description={error}
        orderNumber={orderNumber}
      />
    );
  }

  if (result) {
    return (
      <StatePage
        success
        icon={CheckCircle2}
        title="Reattempt requested"
        description="Thank you. We have received your confirmation and requested Delhivery to attempt delivery again."
        orderNumber={
          order?.orderNumber ||
          orderNumber
        }
      />
    );
  }

  const customer = getCustomer(order);
  const items = getItems(order);

  const pricing = order?.pricing || {};

  const finalPayable =
    pricing.finalPayable ??
    order?.finalPayable ??
    order?.totalAmount ??
    0;

  const ndrReason =
    order?.ndr?.reason ||
    order?.ndr?.instructions ||
    order?.ndr?.rawStatus ||
    "Delivery could not be completed";

  return (
    <main className="min-h-[100dvh] bg-[#f5f5f3] text-neutral-950">
      <div className="mx-auto w-full max-w-2xl px-2.5 py-3 sm:px-5 sm:py-6">
        <section className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
          <header className="relative overflow-hidden bg-neutral-950 px-4 py-5 text-white sm:px-6">
            <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-white/[0.04]" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/80">
                  Delivery Action Required
                </span>

                <span className="text-[10px] text-white/50">
                  #{order?.orderNumber ||
                    orderNumber}
                </span>
              </div>

              <h1 className="mt-4 text-[23px] font-black leading-tight tracking-[-0.03em] sm:text-[28px]">
                Should we attempt delivery
                again?
              </h1>

              <p className="mt-1.5 max-w-md text-xs leading-5 text-white/60">
                Please review your order and
                confirm a delivery reattempt.
              </p>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-white/50">
                <Truck className="h-3.5 w-3.5" />

                AWB{" "}
                {order?.ndr?.waybill ||
                  order?.shipment?.awb ||
                  "—"}
              </div>
            </div>
          </header>

          <div className="space-y-4 p-3 sm:p-5">
            {(localError || error) && (
              <div className="flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                <p className="text-[11px] leading-4 text-red-700">
                  {localError || error}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100">
                  <CircleAlert className="h-4 w-4 text-amber-700" />
                </div>

                <div>
                  <p className="text-xs font-bold text-neutral-950">
                    Previous delivery attempt
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-neutral-600">
                    {ndrReason}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle
                icon={Package}
                title="Your order"
                value={`${items.length} ${
                  items.length === 1
                    ? "item"
                    : "items"
                }`}
              />

              <div className="mt-2 space-y-2">
                {items.map(
                  (item, index) => (
                    <ProductCard
                      key={
                        item.lineId ||
                        item._id ||
                        index
                      }
                      item={item}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <InfoCard
                icon={MapPin}
                title="Delivery details"
              >
                <p className="text-xs font-bold text-neutral-900">
                  {customer.name}
                </p>

                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-600">
                  <Phone className="h-3 w-3" />
                  {customer.phone || "—"}
                </p>

                <p className="mt-2 border-t border-neutral-100 pt-2 text-[10px] leading-4 text-neutral-500">
                  {customer.address || "—"}
                </p>
              </InfoCard>

              <InfoCard
                icon={ReceiptText}
                title="Order summary"
              >
                <DetailRow
                  label="Payment"
                  value={formatText(
                    order?.paymentMethod,
                  )}
                />

                <DetailRow
                  label="Status"
                  value={formatText(
                    order?.fulfillmentStatus,
                  )}
                />

                <div className="mt-2 flex items-end justify-between border-t border-neutral-100 pt-2">
                  <span className="text-[10px] text-neutral-500">
                    Amount payable
                  </span>

                  <span className="text-base font-black">
                    {money(finalPayable)}
                  </span>
                </div>
              </InfoCard>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <TrustItem
                icon={ShieldCheck}
                title="Secure"
                text="Request"
              />

              <TrustItem
                icon={Package}
                title="Verified"
                text="Order"
              />

              <TrustItem
                icon={Truck}
                title="Tracked"
                text="Delivery"
              />
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={handleReattempt}
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-[13px] font-bold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Reattempt My Delivery
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[10px] leading-4 text-neutral-400">
                By confirming, you request
                another delivery attempt at
                the same address.
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-3 text-center">
              <p className="text-[11px] font-semibold">
                Need to update your address
                or phone?
              </p>

              <a
                href={supportLink(
                  order?.orderNumber ||
                    orderNumber,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Chat with OATCLUB Support
              </a>
            </div>
          </div>
        </section>

        <p className="py-3 text-center text-[9px] text-neutral-400">
          OATCLUB · Own All Trends
        </p>
      </div>
    </main>
  );
}

function ProductCard({ item }) {
  const snapshot =
    item.productSnapshot || {};

  const title =
    item.title ||
    snapshot.title ||
    "Product";

  const image =
    item.image ||
    snapshot.thumbnail ||
    snapshot.images?.[0] ||
    "/placeholder.png";

  return (
    <div className="flex gap-2.5 rounded-xl border border-neutral-100 bg-[#fafafa] p-2.5">
      <div className="h-[72px] w-[58px] shrink-0 overflow-hidden rounded-xl bg-white">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold leading-4">
              {title}
            </p>

            {(item.productCode ||
              snapshot.productCode) && (
              <p className="mt-1 text-[9px] font-medium text-neutral-400">
                {item.productCode ||
                  snapshot.productCode}
              </p>
            )}
          </div>

          <p className="shrink-0 text-xs font-bold">
            {money(
              item.subtotal ||
                item.price,
            )}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {(item.selectedSize ||
            item.size) && (
            <Tag>
              Size{" "}
              {item.selectedSize ||
                item.size}
            </Tag>
          )}

          <Tag>
            Qty{" "}
            {item.quantity ||
              item.qty ||
              1}
          </Tag>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-neutral-500" />
        <h2 className="text-xs font-bold">
          {title}
        </h2>
      </div>

      <span className="text-[10px] text-neutral-400">
        {value}
      </span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-neutral-500" />
        <h3 className="text-xs font-bold">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[10px] text-neutral-500">
        {label}
      </span>

      <span className="text-right text-[10px] font-semibold">
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
    <div className="rounded-xl bg-neutral-50 px-2 py-3 text-center">
      <Icon className="mx-auto h-4 w-4" />

      <p className="mt-1 text-[9px] font-bold">
        {title}
      </p>

      <p className="text-[8px] text-neutral-400">
        {text}
      </p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-neutral-600">
      {children}
    </span>
  );
}

function StatePage({
  icon: Icon,
  title,
  description,
  orderNumber,
  success = false,
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f5f5f3] px-3">
      <section className="w-full max-w-md rounded-[24px] border border-neutral-200 bg-white p-5 text-center shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
        <div
          className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${
            success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-400">
          Order #{orderNumber || "—"}
        </p>

        <h1 className="mt-1 text-xl font-black">
          {title}
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-neutral-500">
          {description}
        </p>

        <a
          href={supportLink(orderNumber)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-xs font-bold text-white"
        >
          <MessageCircle className="h-4 w-4" />
          Contact OATCLUB Support
        </a>
      </section>
    </main>
  );
}
