"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { X, ChevronLeft, Package, Truck, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useRmaStore } from "@/store/useRmaStore";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

const STATUS_BADGE = {
  processing: "bg-yellow-100 text-yellow-900",
  packed: "bg-indigo-100 text-indigo-900",
  picked: "bg-blue-100 text-blue-900",
  shipped: "bg-blue-100 text-blue-900",
  out_for_delivery: "bg-purple-100 text-purple-900",
  delivered: "bg-green-100 text-green-900",
  return_requested: "bg-orange-100 text-orange-900",
  exchange_requested: "bg-orange-100 text-orange-900",
  returned: "bg-gray-200 text-gray-900",
  rto: "bg-black/10 text-black",
  cancelled: "bg-red-100 text-red-900",
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
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "";
  }
}

function prettyStatus(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return "Pending";
  return v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { customer, loading: authLoading, isAuthenticated } = useAuthStore();
  const { order, fetchOrderById, updateOrderStatus, loading: orderLoading, error: orderError } = useOrderStore();
  const { rmas, fetchRmasByOrder, createRma, error: rmaError } = useRmaStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [showExchangeModal, setShowExchangeModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const safeItems = useMemo(() => {
    const list = order?.items || [];
    return Array.isArray(list) ? list : [];
  }, [order]);

  const isOwner = useMemo(() => {
    if (!order || !customer?._id) return true;
    const oid = order?.customerId?._id || order?.customerId;
    return String(oid) === String(customer._id);
  }, [order, customer?._id]);

  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99999] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full hover:bg-black/20 transition">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );

  if (authLoading || orderLoading) {
    return (
      <section className="p-6 md:p-10 bg-white">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="text-black/60">Loading order...</div>
      </section>
    );
  }

  if (orderError) {
    return (
      <section className="p-6 md:p-10 bg-white">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="text-red-600 font-medium">Failed to load order: {orderError}</div>
        <button onClick={() => fetchOrderById(id)} className="mt-4 px-4 py-2 rounded-full bg-black text-white text-sm font-semibold">Retry</button>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="p-10 bg-white">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-2xl font-semibold">Order Not Found</h1>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="p-10 bg-white">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-2xl font-semibold">Not Allowed</h1>
        <p className="text-sm text-black/60 mt-2">This order doesn’t belong to your account.</p>
      </section>
    );
  }

  const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
  const BadgeClass = STATUS_BADGE[statusKey] || "bg-black/10 text-black";
  const StatusIcon = STATUS_ICON[statusKey] || Package;
  const canCancel = CANCEL_ALLOWED.includes(statusKey);
  const canShowRma = RMA_ALLOWED.includes(statusKey);

  const submitReturn = async (item) => {
    let toastId = null;
    try {
      setSubmitting(true);
      toastId = toast.loading("Submitting return request...");
      await createRma(order._id, { type: "return", reason: "other", customerNote: returnReason, items: [{ orderLineId: item.lineId, quantity: 1 }] });
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
      await createRma(order._id, { type: "exchange", reason: "wrong_size", customerNote: `Exchange size to ${selectedSize}`, items: [{ orderLineId: item.lineId, quantity: 1 }], exchangeTo: { productId: item.productId?._id || item.productId, variantId: item.variant?.variantId, variantSku: item.variant?.sku || "", attributes: [{ key: "size", value: selectedSize }], note: `Requested size: ${selectedSize}` } });
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
      setSubmitting(true);
      toastId = toast.loading("Cancelling your order...");
      await updateOrderStatus(order._id, { fulfillmentStatus: "cancelled", adminRemarks: reasonText });
      toast.success("✅ Order cancelled successfully!", { id: toastId });
      setShowCancelModal(false);
      await fetchOrderById(order._id);
    } catch (e) {
      toast.error(e?.message || "Cancel failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="p-6 md:p-10 bg-white">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:opacity-90 transition">
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black">Order {order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).slice(-6)}`}</h1>
        <p className="text-sm text-black/50 mt-1">Placed on {formatDate(order.orderDate || order.createdAt)}</p>
      </div>

      <div className="rounded-3xl bg-black/[0.03] p-6 shadow-sm mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-sm text-black/50">Total Amount</p>
          <p className="text-3xl font-semibold text-black">₹{order.finalPayable ?? order.totalAmount ?? 0}</p>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${BadgeClass}`}>
          <StatusIcon size={16} />
          {prettyStatus(order.fulfillmentStatus)}
        </span>
      </div>

      {rmas?.length > 0 ? (
        <div className="rounded-3xl bg-black/[0.03] p-6 shadow-sm mb-10">
          <h2 className="text-lg font-semibold mb-4 text-black">Your Return / Exchange Requests</h2>
          <div className="space-y-3">
            {rmas.map((r) => (
              <div key={r.rmaNumber} className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-semibold text-black">{r.rmaNumber}</p>
                  <p className="text-sm text-black/50">{prettyStatus(r.type)} • {prettyStatus(r.status)}</p>
                </div>
                {r.fee?.amount > 0 ? <span className="text-xs px-3 py-1 rounded-full bg-black text-white">Fee: ₹{r.fee.amount} ({r.fee.status})</span> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {safeItems.map((item, idx) => {
          const title = item?.productSnapshot?.title || "Product";
          const thumb = item?.productSnapshot?.thumbnail || "/placeholder.png";
          const qty = item.quantity ?? 1;
          const price = item.price ?? 0;
          const sizeAttr = item?.variant?.attributes?.find((a) => a.key === "size")?.value || null;

          return (
            <div key={item.lineId || idx} className="rounded-3xl bg-white shadow-sm p-5 flex gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt={title} className="w-24 h-28 rounded-2xl bg-black/5 object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-lg text-black">{title}</p>
                <div className="text-sm text-black/50 space-y-1 mt-2">
                  {sizeAttr ? <p>Size: {sizeAttr}</p> : null}
                  <p>Qty: {qty}</p>
                </div>
                <p className="mt-3 font-semibold text-black text-lg">₹{price}</p>
                {canShowRma ? (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <button onClick={() => setShowExchangeModal({ item, name: title, availableSizes: ["XS", "S", "M", "L", "XL"] })} className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold hover:opacity-90 transition">Exchange Size</button>
                    <button onClick={() => setShowReturnModal({ item, name: title })} className="px-5 py-2 rounded-full bg-black/10 text-black text-sm font-semibold hover:bg-black/20 transition">Return Item</button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {canCancel ? (
        <div className="mt-12">
          <button onClick={() => setShowCancelModal(true)} className="w-full py-4 rounded-3xl font-semibold text-sm bg-black text-white hover:opacity-90 transition">Cancel Entire Order</button>
          <p className="text-xs text-black/40 mt-3 text-center">You can cancel only before Out for Delivery.</p>
        </div>
      ) : null}

      <CancelOrderModal open={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={handleCancelConfirm} loading={submitting} orderNumber={order?.orderNumber} />

      {showReturnModal ? (
        <Modal onClose={() => { setShowReturnModal(null); setReturnReason(""); }}>
          <h2 className="text-xl font-semibold mb-4 text-black">Return Item</h2>
          <p className="text-sm text-black/60 mb-4">Reason for returning: <b>{showReturnModal.name}</b></p>
          <select className="w-full rounded-2xl bg-black/5 p-3 mb-5 text-sm outline-none" onChange={(e) => setReturnReason(e.target.value)} value={returnReason}>
            <option value="" disabled>Choose a reason…</option>
            <option value="Size too small">Size too small</option>
            <option value="Size too large">Size too large</option>
            <option value="Wrong item received">Wrong item received</option>
            <option value="Damaged product">Damaged product</option>
            <option value="Not as described">Not as described</option>
          </select>
          <button disabled={!returnReason || submitting} onClick={() => submitReturn(showReturnModal.item)} className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${returnReason ? "bg-black text-white hover:opacity-90" : "bg-black/10 text-black/40 cursor-not-allowed"}`}>{submitting ? "Submitting..." : "Submit Return Request"}</button>
        </Modal>
      ) : null}

      {showExchangeModal ? (
        <Modal onClose={() => { setShowExchangeModal(null); setSelectedSize(null); }}>
          <h2 className="text-xl font-semibold mb-3 text-black">Exchange Size</h2>
          <p className="text-sm text-black/60 mb-4">Select new size for <b>{showExchangeModal.name}</b></p>
          <div className="mb-6 flex flex-wrap gap-2">
            {showExchangeModal.availableSizes.map((sz) => (
              <button key={sz} onClick={() => setSelectedSize(sz)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${selectedSize === sz ? "bg-black text-white" : "bg-black/10 text-black hover:bg-black/20"}`}>{sz}</button>
            ))}
          </div>
          <button disabled={!selectedSize || submitting} onClick={() => submitExchange(showExchangeModal.item)} className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${selectedSize ? "bg-black text-white hover:opacity-90" : "bg-black/10 text-black/40 cursor-not-allowed"}`}>{submitting ? "Submitting..." : "Submit Exchange"}</button>
        </Modal>
      ) : null}

      {rmaError ? <p className="text-red-600 text-sm mt-6 font-medium">RMA Error: {rmaError}</p> : null}
    </section>
  );
}
