"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { X, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";

/* ----------------------------------------------------
    STATUS COLORS (backend statuses)
---------------------------------------------------- */
const STATUS_COLORS = {
  delivered: "text-green-600 bg-green-100",
  shipped: "text-blue-600 bg-blue-100",
  out_for_delivery: "text-blue-600 bg-blue-100",
  packed: "text-yellow-700 bg-yellow-100",
  processing: "text-yellow-700 bg-yellow-100",
  returned: "text-purple-700 bg-purple-100",
  cancelled: "text-red-600 bg-red-100",
};

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

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [returnReason, setReturnReason] = useState("");

  // Load order
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!id) return;

    fetchOrderById(id);

    // "real-time" polling
    const interval = setInterval(() => fetchOrderById(id), 15000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, id, fetchOrderById, router]);

  const safeItems = useMemo(() => {
    const list = order?.items || [];
    return Array.isArray(list) ? list : [];
  }, [order]);

  // Basic ownership guard (optional)
  const isOwner = useMemo(() => {
    if (!order || !customer?._id) return true; // don't block while loading
    const oid = order?.customerId?._id || order?.customerId;
    return String(oid) === String(customer._id);
  }, [order, customer?._id]);

  /* ----------------------------------------------------
      MODALS
  ---------------------------------------------------- */
  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[99999] p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full relative shadow-lg animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );

  if (authLoading || orderLoading) {
    return (
      <section className="p-6 md:p-10">
        <div className="text-gray-600">Loading order...</div>
      </section>
    );
  }

  if (orderError) {
    return (
      <section className="p-6 md:p-10">
        <div className="text-red-600 font-medium">Failed to load order: {orderError}</div>
        <button
          onClick={() => fetchOrderById(id)}
          className="mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm"
        >
          Retry
        </button>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="p-10">
        <h1 className="text-2xl font-semibold">Order Not Found</h1>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="p-10">
        <h1 className="text-2xl font-semibold">Not Allowed</h1>
        <p className="text-sm text-gray-600 mt-2">This order doesn’t belong to your account.</p>
      </section>
    );
  }

  const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
  const statusClass = STATUS_COLORS[statusKey] || "text-gray-700 bg-gray-100";

  const canCancel =
    ["processing", "packed"].includes(statusKey) && String(order.paymentStatus || "pending") !== "paid";

  /* ----------------------------------------------------
      MAIN UI
  ---------------------------------------------------- */
  return (
    <section className="p-6 md:p-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <h1 className="text-3xl font-semibold mb-6">
        Order {order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).slice(-6)}`}
      </h1>

      {/* Order Info */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6 space-y-2">
        <p className="text-gray-600">
          Placed on: <span className="font-medium text-gray-900">{formatDate(order.orderDate || order.createdAt)}</span>
        </p>

        <p className="text-gray-600">
          Total: <span className="font-semibold text-gray-900">₹{order.finalPayable ?? order.totalAmount ?? 0}</span>
        </p>

        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
          {prettyStatus(order.fulfillmentStatus)}
        </span>

        {order.trackingDetails?.trackingId ? (
          <p className="text-sm text-gray-700 mt-3">
            Tracking:{" "}
            <span className="font-medium">
              {order.trackingDetails.trackingId}
              {order.trackingDetails.courierName ? ` • ${order.trackingDetails.courierName}` : ""}
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-3">Tracking will appear once shipped.</p>
        )}
      </div>

      {/* Order Items */}
      <div className="flex flex-col gap-5">
        {safeItems.map((item, idx) => {
          const prod = item.productId || {};
          const title = item.name || prod.title || prod.name || "Product";
          const thumb = prod.thumbnail || item?.thumbnail || "/placeholder.png";
          const qty = item.quantity ?? 1;
          const price = item.price ?? 0;

          const size = item?.variant?.size || item?.variant?.attributes?.size || null;
          const color = item?.variant?.color || item?.variant?.attributes?.color || null;

          return (
            <div
              key={prod?._id || item.productId?._id || idx}
              className="bg-white border rounded-xl p-5 flex gap-4 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt={title}
                className="w-24 h-28 rounded-lg bg-gray-100 object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold text-lg">{title}</p>

                <div className="text-gray-600 text-sm space-y-1 mt-1">
                  {size ? <p>Size: {size}</p> : null}
                  {color ? <p>Color: {color}</p> : null}
                  <p>Qty: {qty}</p>
                </div>

<p className="mt-2 font-semibold text-black/90">₹{price}</p>

                {/* Customer actions: keep UI but currently mock-only */}
                <div className="flex gap-3 mt-4 flex-wrap">
                  <button
                    onClick={() =>
                      setShowExchangeModal({
                        name: title,
                        availableSizes: ["XS", "S", "M", "L", "XL"],
                      })
                    }
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Exchange Size
                  </button>

                  <button
                    onClick={() => setShowReturnModal({ name: title })}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Return Item
                  </button>

                  {prod?.slug ? (
                    <Link
                      href={`/product/${prod.slug}`}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                    >
                      View Product
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Entire Order */}
      <div className="mt-8">
        <button
          disabled={!canCancel}
          onClick={() => setShowCancelModal(true)}
          className={`w-full py-3 rounded-xl font-medium ${
            canCancel
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Cancel Entire Order
        </button>
        {!canCancel ? (
          <p className="text-xs text-gray-500 mt-2">
            You can cancel only before shipping (Processing/Packed and unpaid).
          </p>
        ) : null}
      </div>

      {/* ----------------------------------------------------
          MODAL: CANCEL ORDER (real API)
      ---------------------------------------------------- */}
      {showCancelModal && (
        <Modal onClose={() => setShowCancelModal(false)}>
          <h2 className="text-xl font-semibold mb-3">Cancel Order?</h2>
          <p className="text-gray-600 text-sm mb-5">
            Are you sure you want to cancel this order{" "}
            <b>{order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).slice(-6)}`}</b>?
          </p>

          <button
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
            onClick={async () => {
              try {
                await updateOrderStatus(order._id, { fulfillmentStatus: "cancelled" });
                setShowCancelModal(false);
              } catch (e) {
                alert(e.message || "Failed to cancel order");
              }
            }}
          >
            Yes, Cancel Order
          </button>
        </Modal>
      )}

      {/* ----------------------------------------------------
          MODAL: EXCHANGE SIZE (still mock UI)
      ---------------------------------------------------- */}
     {showExchangeModal && (
  <Modal
    onClose={() => {
      setShowExchangeModal(null);
      setSelectedSize(null);
    }}
  >
    <h2 className="mb-3 text-xl font-semibold">
      Exchange Size
    </h2>

    <p className="mb-4 text-sm text-black/70">
      Select a new size for <strong>{showExchangeModal.name}</strong>
    </p>

    <div className="mb-6 flex flex-wrap gap-2">
      {showExchangeModal.availableSizes.map((sz) => (
        <button
          key={sz}
          onClick={() => setSelectedSize(sz)}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            selectedSize === sz
              ? "border-black bg-black text-white"
              : "border-black/15 bg-white hover:bg-black/5"
          }`}
        >
          {sz}
        </button>
      ))}
    </div>

    <button
      disabled={!selectedSize}
      onClick={() => {
        alert(`Exchange requested (UI only): ${selectedSize}`);
        setShowExchangeModal(null);
        setSelectedSize(null);
      }}
      className={`w-full rounded-lg py-3 text-sm font-semibold transition ${
        selectedSize
          ? "bg-black text-white hover:opacity-90"
          : "bg-black/10 text-black/40 cursor-not-allowed"
      }`}
    >
      Submit Exchange
    </button>
  </Modal>
)}


      {/* ----------------------------------------------------
          MODAL: RETURN REQUEST (still mock UI)
      ---------------------------------------------------- */}
      {showReturnModal && (
        <Modal
          onClose={() => {
            setShowReturnModal(null);
            setReturnReason("");
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Return Item</h2>

          <p className="text-gray-600 mb-3">
            Select a reason for returning: <b>{showReturnModal.name}</b>
          </p>

          <select
            className="w-full border rounded-lg p-3 mb-5"
            onChange={(e) => setReturnReason(e.target.value)}
            value={returnReason}
          >
            <option value="" disabled>
              Choose a reason…
            </option>
            <option>Size too small</option>
            <option>Size too large</option>
            <option>Wrong item received</option>
            <option>Damaged product</option>
            <option>Not as described</option>
          </select>

        <button
  disabled={!returnReason}
  onClick={() => {
    alert(`Return submitted (UI only): ${returnReason}`);
    setShowReturnModal(null);
    setReturnReason("");
  }}
  className={`w-full rounded-lg py-3 text-sm font-semibold transition ${
    returnReason
      ? "bg-black text-white hover:opacity-90"
      : "bg-black/10 text-black/40 cursor-not-allowed"
  }`}
>
  Submit Return Request
</button>

        </Modal>
      )}
    </section>
  );
}
