"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useRmaStore } from "@/store/useRmaStore";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

/* -------------------------------------------
   ✅ UI Helpers
-------------------------------------------- */
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

const CANCEL_ALLOWED = ["processing", "packed", "picked", "shipped"];
const RMA_ALLOWED = ["delivered"];

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

function prettyStatus(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return "Pending";
  return v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const money = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString("en-IN") : "0";
};

const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-gray-700">
    {children}
  </span>
);



/* -------------------------------------------
   ✅ Modal Wrapper
-------------------------------------------- */
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99999] p-4">
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/5 p-2 rounded-full hover:bg-black/10 transition"
      >
        <X size={18} />
      </button>
      {children}
    </div>
  </div>
);

/* ==========================================================
   ✅ PAGE
========================================================== */
export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { customer, loading: authLoading, isAuthenticated } = useAuthStore();

  const {
    order,
    fetchOrderById,
    updateOrderStatus,
    loading: orderLoading,
    error: orderError,
  } = useOrderStore();

  const { rmas, fetchRmasByOrder, createRma, error: rmaError } = useRmaStore();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState("");

  const [showExchangeModal, setShowExchangeModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [remarkDraft, setRemarkDraft] = useState("");
const [savingRemark, setSavingRemark] = useState(false);

  /* -------------------------------------------
     ✅ LOAD ORDER + RMAs
  -------------------------------------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return router.push("/auth/login");
    if (!id) return;

    fetchOrderById(id);
    fetchRmasByOrder(id);

    const interval = setInterval(() => {
      fetchOrderById(id);
      fetchRmasByOrder(id);
    }, 15000);

    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, id, fetchOrderById, fetchRmasByOrder, router]);


  useEffect(() => {
  if (order?.customerSupportRemark != null) {
    setRemarkDraft(String(order.customerSupportRemark));
  }
}, [order?._id]);


  const safeItems = useMemo(() => {
    const list = order?.items || [];
    return Array.isArray(list) ? list : [];
  }, [order]);

  const isOwner = useMemo(() => {
    if (!order || !customer?._id) return true;
    const oid = order?.customerId?._id || order?.customerId;
    return String(oid) === String(customer._id);
  }, [order, customer?._id]);

  /* -------------------------------------------
     ✅ Loading + Errors
  -------------------------------------------- */
  if (authLoading || orderLoading) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-6 md:p-10">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <p className="text-gray-500">Loading order...</p>
      </section>
    );
  }

  if (orderError) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-6 md:p-10">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-6">
          <p className="text-red-600 font-semibold">
            Failed to load order: {orderError}
          </p>
          <button
            onClick={() => fetchOrderById(id)}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-black text-white text-sm font-semibold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-10">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-2xl font-semibold">Order Not Found</h1>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-10">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-2xl font-semibold">Not Allowed</h1>
        <p className="text-sm text-gray-500 mt-2">
          This order doesn’t belong to your account.
        </p>
      </section>
    );
  }

  const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
  const badgeClass = STATUS_BADGE[statusKey] || "bg-black/5 text-black";
  const StatusIcon = STATUS_ICON[statusKey] || Package;
  const canCancel = CANCEL_ALLOWED.includes(statusKey);
  const canShowRma = RMA_ALLOWED.includes(statusKey);

  /* -------------------------------------------
     ✅ RMA Submit Handlers
  -------------------------------------------- */
  const submitReturn = async (item) => {
    let toastId = null;
    try {
      setSubmitting(true);
      toastId = toast.loading("Submitting return request...");

      await createRma(order._id, {
        type: "return",
        reason: "other",
        customerNote: returnReason,
        items: [{ orderLineId: item.lineId, quantity: 1 }],
      });

      toast.success("✅ Return request created!", { id: toastId });
      setShowReturnModal(null);
      setReturnReason("");

      await fetchRmasByOrder(order._id);
      await fetchOrderById(order._id);
    } catch (e) {
      toast.error(e?.message || "Failed to create return request", { id: toastId });
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

      toast.success("✅ Exchange request created!", { id: toastId });

      setShowExchangeModal(null);
      setSelectedSize(null);

      await fetchRmasByOrder(order._id);
      await fetchOrderById(order._id);
    } catch (e) {
      toast.error(e?.message || "Failed to create exchange request", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async (reasonText) => {
  let toastId = null;

  try {
    if (!order?._id) throw new Error("Order not found");

    setSubmitting(true);
    toastId = toast.loading("Cancelling your order...");

    const clean = String(reasonText ?? "").trim();
    const finalReason = clean ? `Cancelled by customer: ${clean}` : "Cancelled by customer";

    await updateOrderStatus(order._id, {
      fulfillmentStatus: "cancelled",
      adminRemarks: finalReason,
    });

    toast.success("Order cancelled successfully!", { id: toastId });
    setShowCancelModal(false);

    // optional: refresh local order
    await fetchOrderById(order._id);
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
    await fetchOrderById(order._id);
  } catch (e) {
    toast.error(e?.message || "Failed to save remark", { id: toastId });
  } finally {
    setSavingRemark(false);
  }
};




  /* -------------------------------------------
     ✅ UI
  -------------------------------------------- */
  return (
    <section className="min-h-screen bg-[#F7F7FA] p-6 md:p-10">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Order{" "}
              {order.orderNumber
                ? `#${order.orderNumber}`
                : `#${String(order._id).slice(-6)}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.orderDate || order.createdAt)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>Items: {safeItems.length}</Chip>
              <Chip>Payment: {prettyStatus(order.paymentMethod)}</Chip>
              <Chip>Status: {prettyStatus(order.paymentStatus)}</Chip>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badgeClass}`}
            >
              <StatusIcon size={16} />
              {prettyStatus(order.fulfillmentStatus)}
            </span>
            <div className="text-right">
              <p className="text-xs text-gray-500">Final Payable</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{money(order.finalPayable ?? order.totalAmount ?? 0)}
              </p>
            </div>
          </div>
        </div>

   {/* ✅ ORDER REMARK (Customer Support) */}
<div className="bg-white rounded-3xl shadow-sm p-6">
  <div className="flex items-center justify-between gap-3">
    <h2 className="text-lg font-semibold text-gray-900">Order Remark</h2>

    <button
      onClick={saveOrderRemark}
      disabled={savingRemark}
      className="
        px-4 py-2 rounded-xl text-sm font-semibold
        bg-black text-white
        hover:opacity-90
        disabled:opacity-40
        transition
      "
    >
      {savingRemark ? "Saving..." : "Save"}
    </button>
  </div>

  <textarea
    value={remarkDraft}
    onChange={(e) => setRemarkDraft(e.target.value)}
    placeholder="Add internal remark for this order…"
    rows={4}
    className="
      mt-4 w-full rounded-2xl border border-gray-200
      bg-gray-50 p-4 text-sm text-gray-900
      outline-none resize-none
      focus:bg-white focus:border-black/20
    "
  />
</div>



        {/* RMAs */}
        {Array.isArray(rmas) && rmas.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Return / Exchange Requests
            </h2>

            <div className="space-y-3">
              {rmas.map((r) => (
                <div
                  key={r.rmaNumber}
                  className="rounded-2xl bg-gray-50 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{r.rmaNumber}</p>
                    <p className="text-sm text-gray-500">
                      {prettyStatus(r.type)} • {prettyStatus(r.status)}
                    </p>
                  </div>

                  {r.fee?.amount > 0 ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-black text-white font-semibold">
                      Fee ₹{money(r.fee.amount)} ({prettyStatus(r.fee.status)})
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-black/5 text-gray-700 font-semibold">
                      No Fee
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ORDER ITEMS */}
        <div className="space-y-4">
          {safeItems.map((item, idx) => {
            const snap = item?.productSnapshot || {};
            const v = item?.variant || {};
            const title = snap?.title || "Product";
            const thumb = snap?.thumbnail || "/placeholder.png";
            const qty = item?.quantity ?? 1;
            const price = item?.price ?? 0;

            const size = item?.selectedSize || v?.attributes?.find((a) => String(a?.key).toLowerCase() === "size")?.value || "";
            const color = item?.selectedColor || v?.attributes?.find((a) => String(a?.key).toLowerCase() === "color")?.value || "";

            return (
              <div
                key={item.lineId || idx}
                className="bg-white rounded-3xl shadow-sm p-5 flex gap-5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={title}
                  className="w-24 h-28 rounded-2xl bg-gray-100 object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-lg text-gray-900 truncate">
                        {title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{money(price)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Subtotal ₹{money(item?.subtotal)}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Actions */}
                  {canShowRma ? (
                    <div className="flex flex-wrap gap-3 mt-5">
                      <button
                        onClick={() =>
                          setShowExchangeModal({
                            item,
                            name: title,
                            availableSizes: ["XS", "S", "M", "L", "XL"],
                          })
                        }
                        className="px-5 py-2.5 rounded-2xl bg-black text-white text-sm font-semibold hover:opacity-90 transition"
                      >
                        Exchange Size
                      </button>

                      <button
                        onClick={() => setShowReturnModal({ item, name: title })}
                        className="px-5 py-2.5 rounded-2xl bg-black/5 text-gray-900 text-sm font-semibold hover:bg-black/10 transition"
                      >
                        Return Item
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* CANCEL ORDER */}
    {canCancel ? (
  <div className="pt-4">
    <button
      onClick={() => setShowCancelModal(true)}
      className="
        w-full py-3.5 rounded-2xl text-sm font-semibold
        bg-red-500/10 text-red-700
        hover:bg-red-500/15
        active:scale-[0.99]
        transition
      "
    >
      Cancel Entire Order
    </button>

    <p className="mt-2.5 text-center text-xs text-black/45">
      You can cancel only before{" "}
      <span className="font-medium text-black/70">Out for Delivery</span>.
    </p>
  </div>
) : null}

      </div>

      {/* Cancel Modal */}
      <CancelOrderModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        loading={submitting}
        orderNumber={order?.orderNumber}
      />

      {/* Return Modal */}
      {showReturnModal ? (
        <Modal
          onClose={() => {
            setShowReturnModal(null);
            setReturnReason("");
          }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3">Return Item</h2>

          <p className="text-sm text-gray-500 mb-4">
            Select reason for returning{" "}
            <span className="font-semibold text-gray-900">
              {showReturnModal.name}
            </span>
          </p>

          <select
            className="w-full rounded-2xl bg-gray-100 p-3 text-sm outline-none mb-5"
            onChange={(e) => setReturnReason(e.target.value)}
            value={returnReason}
          >
            <option value="" disabled>
              Choose a reason…
            </option>
            <option value="Size too small">Size too small</option>
            <option value="Size too large">Size too large</option>
            <option value="Wrong item received">Wrong item received</option>
            <option value="Damaged product">Damaged product</option>
            <option value="Not as described">Not as described</option>
          </select>

          <button
            disabled={!returnReason || submitting}
            onClick={() => submitReturn(showReturnModal.item)}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
              returnReason
                ? "bg-black text-white hover:opacity-90"
                : "bg-black/10 text-black/40 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Return Request"}
          </button>
        </Modal>
      ) : null}

      {/* Exchange Modal */}
      {showExchangeModal ? (
        <Modal
          onClose={() => {
            setShowExchangeModal(null);
            setSelectedSize(null);
          }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Exchange Size</h2>

          <p className="text-sm text-gray-500 mb-4">
            Select new size for{" "}
            <span className="font-semibold text-gray-900">
              {showExchangeModal.name}
            </span>
          </p>

          <div className="mb-6 flex flex-wrap gap-2">
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

      {rmaError ? (
        <p className="text-red-600 text-sm mt-6 font-medium text-center">
          RMA Error: {rmaError}
        </p>
      ) : null}
    </section>
  );
}
