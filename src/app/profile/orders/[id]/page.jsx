"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  X,
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Star,
} from "lucide-react";

import OrderItemReviewSection from "@/components/reviews/OrderItemReviewSection";
import ReturnFileModal from "@/components/profile/ReturnFileModal";
import ReturnExchangeBanner from "@/components/profile/ReturnExchangeBanner";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import OrderProductTimeline from "@/components/profile/OrderProductTimeline";

import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useRmaStore } from "@/store/useRmaStore";
import { useReviewStore } from "@/store/useReviewStore";

const STATUS_BADGE = {
  processing: "bg-yellow-50 text-yellow-700",
  packed: "bg-indigo-50 text-indigo-700",
  picked: "bg-blue-50 text-blue-700",
  shipped: "bg-blue-50 text-blue-700",
  out_for_delivery: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  return_requested: "bg-orange-50 text-orange-700",
  exchange_requested: "bg-orange-50 text-orange-700",
  returned: "bg-gray-100 text-gray-700",
  rto: "bg-black/5 text-black",
  cancelled: "bg-red-50 text-red-700",
};

const STATUS_ICON = {
  processing: Package,
  packed: Package,
  picked: Truck,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  return_requested: RotateCcw,
  exchange_requested: RotateCcw,
  returned: RotateCcw,
  rto: AlertTriangle,
  cancelled: X,
};

const CANCEL_ALLOWED = ["processing", "packed"];
const RMA_ALLOWED = ["delivered"];
const DAY_MS = 24 * 60 * 60 * 1000;

const money = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString("en-IN") : "0";
};

const safe = (v) => (v == null ? "" : String(v));
const s = (v) => safe(v).trim();

function prettyStatus(sv) {
  const v = String(sv || "").toLowerCase();
  if (!v) return "Pending";
  return v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateIST(d) {
  if (!d) return "";

  try {
    return new Date(d).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold text-gray-700">
    {children}
  </span>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6">
    <div className="bg-white w-full rounded-3xl p-4 sm:p-6 relative shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 bg-black/5 p-2 rounded-full hover:bg-black/10 transition"
        aria-label="Close"
      >
        <X size={18} />
      </button>
      {children}
    </div>
  </div>
);

const toDate = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getDeliveredAtFromOrder = (order) => {
  return (
    toDate(order?.trackingDetails?.deliveredAt) ||
    toDate(order?.shipment?.deliveredAt) ||
    toDate(order?.shipment?.shiprocket?.deliveredAt) ||
    toDate(order?.shipment?.shiprocket?.delivered_date) ||
    toDate(order?.statusTimestamps?.deliveredAt) ||
    toDate(order?.deliveredAt) ||
    null
  );
};

const computeRmaWindow = (deliveredAt, nowMs, windowDays = 7) => {
  const delivered = toDate(deliveredAt);

  if (!delivered) {
    return {
      isDelivered: false,
      isAllowed: false,
      daysLeft: 0,
      expiresAt: null,
    };
  }

  if (!nowMs) {
    return {
      isDelivered: true,
      isAllowed: false,
      daysLeft: 0,
      expiresAt: null,
    };
  }

  const expiresAt = new Date(delivered.getTime() + windowDays * DAY_MS);
  const diffMs = expiresAt.getTime() - nowMs;
  const daysLeft = diffMs > 0 ? Math.ceil(diffMs / DAY_MS) : 0;

  return {
    isDelivered: true,
    isAllowed: daysLeft > 0,
    daysLeft,
    expiresAt,
  };
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    customer,
    loading: authLoading,
    isAuthenticated,
    token,
    updateCustomerPayoutDetails,
  } = useAuthStore();

  const {
  order,
  fetchOrderById,
  fetchOrderByNumber,
  updateOrderStatus,
  cancelOrder,
  loading: orderLoading,
  error: orderError,
} = useOrderStore();

  const {
    rmas,
    fetchRmasByOrder,
    createRma,
    error: rmaError,
  } = useRmaStore();

  const [reviewedByLineId, setReviewedByLineId] = useState({});
  const [checkingReviews, setCheckingReviews] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [remarkDraft, setRemarkDraft] = useState("");
  const [savingRemark, setSavingRemark] = useState(false);

  const [openReviewLineId, setOpenReviewLineId] = useState(null);
  const [returnModal, setReturnModal] = useState(null);

  const [nowMs, setNowMs] = useState(null);

  const reviewStore = useReviewStore();

  const reviewCheckFn =
    reviewStore?.checkReviewed ||
    reviewStore?.hasReviewed ||
    reviewStore?.isReviewed ||
    reviewStore?.getMyReviewByProduct ||
    reviewStore?.fetchMyReviewByProduct ||
    null;

  const isOrderNumber = useMemo(() => {
    const value = String(id || "").trim().toUpperCase();
    return value.startsWith("MIRAY-");
  }, [id]);

  const refetchOrder = useCallback(async () => {
    if (!id) return null;

    if (isOrderNumber && typeof fetchOrderByNumber === "function") {
      return fetchOrderByNumber(id);
    }

    return fetchOrderById(id);
  }, [id, isOrderNumber, fetchOrderById, fetchOrderByNumber]);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return router.push("/auth/login");
    if (!id) return;

    refetchOrder();

    const interval = setInterval(() => {
      refetchOrder();
    }, 15000);

    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, id, refetchOrder, router]);

  useEffect(() => {
    if (!order?._id) return;

    fetchRmasByOrder(order._id);
  }, [order?._id, fetchRmasByOrder]);

  useEffect(() => {
    if (order?.customerSupportRemark != null) {
      setRemarkDraft(String(order.customerSupportRemark));
    }
  }, [order?._id, order?.customerSupportRemark]);

  const safeItems = useMemo(() => {
    const list = order?.items || [];
    return Array.isArray(list) ? list : [];
  }, [order]);

  const statusKey = useMemo(
    () => String(order?.fulfillmentStatus || "").toLowerCase(),
    [order?.fulfillmentStatus]
  );

  const badgeClass = useMemo(
    () => STATUS_BADGE[statusKey] || "bg-black/5 text-black",
    [statusKey]
  );

  const StatusIcon = useMemo(
    () => STATUS_ICON[statusKey] || Package,
    [statusKey]
  );

  const canCancel = useMemo(
    () => CANCEL_ALLOWED.includes(statusKey),
    [statusKey]
  );

  const canShowRma = useMemo(
    () => RMA_ALLOWED.includes(statusKey),
    [statusKey]
  );

  const deliveredAt = useMemo(() => getDeliveredAtFromOrder(order), [order]);
  const deliveredDateText = useMemo(
    () => formatDateIST(deliveredAt),
    [deliveredAt]
  );

  const rmaWindow = useMemo(
    () => computeRmaWindow(deliveredAt, nowMs, 7),
    [deliveredAt, nowMs]
  );

  const rmaEnabled = useMemo(
    () => canShowRma && rmaWindow.isAllowed,
    [canShowRma, rmaWindow.isAllowed]
  );

  const isOwner = useMemo(() => {
    if (!order || !customer?._id) return true;

    const oid = order?.customerId?._id || order?.customerId;
    return String(oid) === String(customer._id);
  }, [order, customer?._id]);

  const storageKeyFor = useCallback(
    (pid) => {
      const cid = s(customer?._id);
      const p = s(pid);

      if (!cid || !p) return "";
      return `review_submitted:${cid}:${p}`;
    },
    [customer?._id]
  );

  const markReviewed = useCallback(
    (lineId, productId) => {
      setReviewedByLineId((prev) => ({
        ...prev,
        [String(lineId)]: true,
      }));

      const k = storageKeyFor(productId);

      if (k) {
        try {
          sessionStorage.setItem(k, "1");
        } catch {}
      }
    },
    [storageKeyFor]
  );

  useEffect(() => {
    const run = async () => {
      if (!order?._id || !customer?._id || !safeItems.length) return;

      setCheckingReviews(true);

      const nextMap = {};

      for (const item of safeItems) {
        const lineKey = String(item?.lineId || "");
        const pid = item?.productId?._id || item?.productId;

        if (!lineKey || !pid) continue;

        const k = storageKeyFor(pid);

        if (k) {
          try {
            if (sessionStorage.getItem(k) === "1") {
              nextMap[lineKey] = true;
              continue;
            }
          } catch {}
        }

        if (typeof reviewCheckFn === "function") {
          try {
            const out =
              reviewCheckFn.length >= 1
                ? await reviewCheckFn({
                    token,
                    productId: pid,
                    customerId: customer._id,
                  })
                : await reviewCheckFn(pid);

            const reviewed =
              out === true ||
              (!!out &&
                typeof out === "object" &&
                (out._id || out.review || out.data));

            if (reviewed) {
              nextMap[lineKey] = true;

              if (k) {
                try {
                  sessionStorage.setItem(k, "1");
                } catch {}
              }
            }
          } catch {}
        }
      }

      setReviewedByLineId((prev) => ({
        ...prev,
        ...nextMap,
      }));

      setCheckingReviews(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id, customer?._id, safeItems]);

  const createReturnRma = async ({ item, reason }) => {
    let toastId = null;

    try {
      if (!item?.lineId) throw new Error("Return item missing");
      if (!s(reason)) throw new Error("Return reason missing");

      setSubmitting(true);
      toastId = toast.loading("Submitting return request...");

      await createRma(order._id, {
        type: "return",
        reason: "other",
        customerNote: reason,
        items: [{ orderLineId: item.lineId, quantity: 1 }],
      });

      toast.success("Return request created!", { id: toastId });
      setReturnModal(null);

      await fetchRmasByOrder(order._id);
      await refetchOrder();
    } catch (e) {
      toast.error(e?.message || "Failed to create return request", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitExchange = async (item) => {
    let toastId = null;

    try {
      setSubmitting(true);
      toastId = toast.loading("Submitting exchange request...");

      await createRma(order._id, {
        type: "exchange",
        reason: "wrong_size",
        customerNote: `Exchange size to ${selectedSize}`,
        items: [{ orderLineId: item.lineId, quantity: 1 }],
        exchangeTo: {
          productId: item.productId?._id || item.productId,
          variantId: item.variant?.variantId,
          variantSku: item.variant?.sku || "",
          attributes: [{ key: "size", value: selectedSize }],
          note: `Requested size: ${selectedSize}`,
        },
      });

      toast.success("Exchange request created!", { id: toastId });

      setShowExchangeModal(null);
      setSelectedSize(null);

      await fetchRmasByOrder(order._id);
      await refetchOrder();
    } catch (e) {
      toast.error(e?.message || "Failed to create exchange request", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

 const handleCancelConfirm = async (reasonText = "") => {
  let toastId = null;

  try {
    if (!order?._id) throw new Error("Order not found");

    setSubmitting(true);
    toastId = toast.loading("Cancelling your order...");

    await cancelOrder(order._id, reasonText);

    toast.success("Order cancelled successfully!", { id: toastId });

    setShowCancelModal(false);
    await refetchOrder();
  } catch (e) {
    toast.error(e?.message || "Cancel failed", { id: toastId });
  } finally {
    setSubmitting(false);
  }
};

  const saveOrderRemark = async () => {
    let toastId = null;

    try {
      if (!order?._id) return;

      setSavingRemark(true);
      toastId = toast.loading("Saving remark...");

      await updateOrderStatus(order._id, {
        customerSupportRemark: remarkDraft,
      });

      toast.success("Remark saved", { id: toastId });
      await refetchOrder();
    } catch (e) {
      toast.error(e?.message || "Failed to save remark", { id: toastId });
    } finally {
      setSavingRemark(false);
    }
  };

  if (authLoading || orderLoading) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-4 sm:p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <p className="text-gray-500">Loading order...</p>
      </section>
    );
  }

  if (orderError) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-4 sm:p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6">
          <p className="text-red-600 font-semibold">
            Failed to load order: {orderError}
          </p>

          <button
            onClick={refetchOrder}
            className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-black text-white text-sm font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-xl font-semibold">Order Not Found</h1>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-xl font-semibold">Not Allowed</h1>
        <p className="text-sm text-gray-500 mt-2">
          This order doesn’t belong to your account.
        </p>
      </section>
    );
  }

  const orderLabel = order.orderNumber
    ? `#${order.orderNumber}`
    : `#${String(order._id).slice(-6)}`;

  const placedOn = formatDateIST(order.orderDate || order.createdAt);

  return (
    <section className="min-h-screen bg-[#F7F7FA] px-3 py-4 sm:px-6 sm:py-6">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition mb-4"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Order {orderLabel}
              </h1>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Placed on {placedOn}
                {statusKey === "delivered" && deliveredDateText
                  ? ` • Delivered on ${deliveredDateText}`
                  : ""}
              </p>
            </div>

            <span
              className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${badgeClass}`}
            >
              <StatusIcon size={14} />
              {prettyStatus(order.fulfillmentStatus)}
            </span>
          </div>

          {statusKey === "delivered" ? (
            <ReturnExchangeBanner order={order} />
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Chip>Items: {safeItems.length}</Chip>
            <Chip>Payment: {prettyStatus(order.paymentMethod)}</Chip>
            <Chip>Status: {prettyStatus(order.paymentStatus)}</Chip>
          </div>

          <div className="rounded-2xl bg-gray-50 p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">
                Final Payable
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ₹{money(order.finalPayable ?? order.totalAmount ?? 0)}
              </p>
            </div>

            <button
  onClick={() => canCancel && setShowCancelModal(true)}
  disabled={!canCancel}
  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition ${
    canCancel
      ? "bg-red-500/10 text-red-700 hover:bg-red-500/15 active:scale-[0.99]"
      : "bg-black/5 text-black/35 cursor-not-allowed"
  }`}
>
  Cancel
</button>
          </div>

          <p className="text-center text-[11px] sm:text-xs text-black/45 leading-relaxed">
  {canCancel ? (
    <>
      You can cancel this order before shipping.
    </>
  ) : (
    <>
      You can cancel order before shipping. If you don’t want it, you can refuse
      to take the parcel at delivery or contact support.
    </>
  )}
</p>
        </div>
      </div>

      <div className="mt-4">
        <OrderProductTimeline order={order} />
      </div>

      <div className="mt-4 bg-white rounded-3xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Order Remark
          </h2>

          <button
            onClick={saveOrderRemark}
            disabled={savingRemark}
            className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-40 transition"
          >
            {savingRemark ? "Saving..." : "Save"}
          </button>
        </div>

        <textarea
          value={remarkDraft}
          onChange={(e) => setRemarkDraft(e.target.value)}
          placeholder="Add internal remark for this order…"
          rows={4}
          className="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 text-sm text-gray-900 outline-none resize-none focus:bg-white focus:border-black/20"
        />
      </div>

      {Array.isArray(rmas) && rmas.length > 0 ? (
        <div className="mt-4 bg-white rounded-3xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Your Return / Exchange Requests
          </h2>

          <div className="space-y-3">
            {rmas.map((r) => (
              <div key={r.rmaNumber} className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {r.rmaNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {prettyStatus(r.type)} • {prettyStatus(r.status)}
                    </p>
                  </div>

                  {r.fee?.amount > 0 ? (
                    <span className="text-[11px] px-3 py-1 rounded-full bg-black text-white font-semibold">
                      Fee ₹{money(r.fee.amount)} ({prettyStatus(r.fee.status)})
                    </span>
                  ) : (
                    <span className="text-[11px] px-3 py-1 rounded-full bg-black/5 text-gray-700 font-semibold">
                      No Fee
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {safeItems.map((item, idx) => {
          const snap = item?.productSnapshot || {};
          const v = item?.variant || {};
          const title = snap?.title || "Product";
          const thumb = snap?.thumbnail || "/placeholder.png";
          const qty = item?.quantity ?? 1;
          const price = item?.price ?? 0;

          const size =
            item?.selectedSize ||
            v?.attributes?.find(
              (a) => String(a?.key).toLowerCase() === "size"
            )?.value ||
            "";

          const color =
            item?.selectedColor ||
            v?.attributes?.find(
              (a) => String(a?.key).toLowerCase() === "color"
            )?.value ||
            "";

          const lineKey = item.lineId || idx;
          const open = openReviewLineId === lineKey;

          const alreadyReviewed = !!reviewedByLineId[String(lineKey)];
          const canWriteReview = statusKey === "delivered" && !alreadyReviewed;

          return (
            <div key={lineKey} className="bg-white rounded-3xl shadow-sm p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-5">
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={thumb}
                    alt={title}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                        {title}
                      </p>

                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                        SKU: {v?.sku || snap?.sku || "-"} • Code:{" "}
                        {snap?.productCode || "-"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {size ? <Chip>Size: {size}</Chip> : null}
                        {color ? <Chip>Color: {color}</Chip> : null}
                        <Chip>Qty: {qty}</Chip>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[11px] sm:text-sm text-gray-500">
                        Price
                      </p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{money(price)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                        Subtotal ₹{money(item?.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      if (alreadyReviewed) return;
                      setOpenReviewLineId((prev) =>
                        prev === lineKey ? null : lineKey
                      );
                    }}
                    disabled={!canWriteReview}
                    title={
                      alreadyReviewed
                        ? "Thanks! You’ve already reviewed this item."
                        : statusKey !== "delivered"
                        ? "You can review after delivery"
                        : "Write a review"
                    }
                    className={`inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      canWriteReview
                        ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.99]"
                        : "bg-black/10 text-black/40 cursor-not-allowed"
                    }`}
                  >
                    <Star
                      size={16}
                      className={
                        canWriteReview
                          ? "fill-white text-white"
                          : "text-black/40"
                      }
                    />
                    {alreadyReviewed
                      ? "Already Reviewed"
                      : checkingReviews
                      ? "Checking..."
                      : "Write Review"}
                  </button>

                  {canShowRma ? (
                    <>
                      <button
                        onClick={() => {
                          if (!rmaEnabled) return;

                          setShowExchangeModal({
                            item,
                            name: title,
                            availableSizes: ["XS", "S", "M", "L", "XL"],
                          });
                        }}
                        disabled={!rmaEnabled}
                        title={
                          !rmaEnabled
                            ? "Exchange allowed within 7 days of delivery"
                            : "Exchange size"
                        }
                        className={`w-full px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                          rmaEnabled
                            ? "bg-black text-white hover:opacity-90"
                            : "bg-black/10 text-black/40 cursor-not-allowed"
                        }`}
                      >
                        Exchange Size
                      </button>

                      <button
                        onClick={() => {
                          if (!rmaEnabled) return;
                          setReturnModal({ item, name: title });
                        }}
                        disabled={!rmaEnabled}
                        title={
                          !rmaEnabled
                            ? "Return allowed within 7 days of delivery"
                            : "Return item"
                        }
                        className={`w-full px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
                          rmaEnabled
                            ? "bg-black/5 text-gray-900 hover:bg-black/10"
                            : "bg-black/10 text-black/40 cursor-not-allowed"
                        }`}
                      >
                        Return Item
                      </button>
                    </>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>

                {alreadyReviewed ? (
                  <p className="text-[11px] text-gray-500">
                    Thanks! You’ve already shared your review for this item.
                  </p>
                ) : null}

                <OrderItemReviewSection
                  open={open && !alreadyReviewed}
                  onToggle={(next) => setOpenReviewLineId(next ? lineKey : null)}
                  delivered={statusKey === "delivered"}
                  customerId={customer?._id}
                  productId={item.productId?._id || item.productId}
                  productCode={item?.productSnapshot?.productCode || ""}
                  productName={title}
                  verifiedPurchase={statusKey === "delivered"}
                  onSubmitted={() =>
                    markReviewed(lineKey, item.productId?._id || item.productId)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <CancelOrderModal
  open={showCancelModal}
  order={order}
  onClose={() => setShowCancelModal(false)}
  onConfirm={handleCancelConfirm}
  loading={submitting}
/>

      {showExchangeModal ? (
        <Modal
          onClose={() => {
            setShowExchangeModal(null);
            setSelectedSize(null);
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Exchange Size
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Select new size for{" "}
            <span className="font-semibold text-gray-900">
              {showExchangeModal.name}
            </span>
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            {showExchangeModal.availableSizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  selectedSize === sz
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            disabled={!selectedSize || submitting}
            onClick={() => submitExchange(showExchangeModal.item)}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
              selectedSize
                ? "bg-black text-white hover:opacity-90"
                : "bg-black/10 text-black/40 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Exchange"}
          </button>
        </Modal>
      ) : null}

      <ReturnFileModal
        open={!!returnModal}
        onClose={() => setReturnModal(null)}
        item={returnModal?.item}
        itemName={returnModal?.name || "Item"}
        customer={customer}
        loading={submitting}
        onSavePayout={async (payload) =>
          await updateCustomerPayoutDetails(payload)
        }
        onSubmitReturn={async ({ item, reason }) => {
          await createReturnRma({ item, reason });
        }}
      />

      {rmaError ? (
        <p className="text-red-600 text-sm mt-6 font-medium text-center">
          RMA Error: {rmaError}
        </p>
      ) : null}
    </section>
  );
}