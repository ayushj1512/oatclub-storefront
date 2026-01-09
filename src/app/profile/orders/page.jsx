"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

// Compact premium UI + colored status badges
const STATUS_COLORS = {
  processing: "text-yellow-900 bg-yellow-100",
  packed: "text-indigo-900 bg-indigo-100",
  picked: "text-blue-900 bg-blue-100",
  shipped: "text-sky-900 bg-sky-100",
  out_for_delivery: "text-purple-900 bg-purple-100",
  delivered: "text-emerald-900 bg-emerald-100",
  return_requested: "text-orange-900 bg-orange-100",
  exchange_requested: "text-orange-900 bg-orange-100",
  returned: "text-gray-900 bg-gray-200",
  rto: "text-black bg-black/10",
  cancelled: "text-red-900 bg-red-100",
};

function pillClass(status) {
  const key = String(status || "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide";
  return `${base} ${STATUS_COLORS[key] || "text-gray-800 bg-gray-100"}`;
}

function prettyStatus(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return "Pending";
  return v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

export default function OrdersPage() {
  const router = useRouter();
  const { customer, loading: authLoading, isAuthenticated } = useAuthStore();
  const { orders, fetchMyOrders, updateOrderStatus, loading, error } =
    useOrderStore();

  // Keeping modal logic if you reuse this modal somewhere else
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return router.push("/auth/login");
    if (!customer?._id) return;

    fetchMyOrders(customer._id);
    const interval = setInterval(() => fetchMyOrders(customer._id), 15000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, customer?._id, fetchMyOrders, router]);

  const myOrders = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);

  const openCancelModal = (order) => {
    setCancelOrder(order);
    setCancelOpen(true);
  };

  const handleCancelConfirm = async (reasonText) => {
    if (!cancelOrder?._id) return;
    let toastId = null;

    try {
      setCancelLoading(true);
      toastId = toast.loading("Cancelling your order...");

      await updateOrderStatus(cancelOrder._id, {
        fulfillmentStatus: "cancelled",
        adminRemarks: reasonText,
      });

      toast.success("Order cancelled successfully!", { id: toastId });
      setCancelOpen(false);
      setCancelOrder(null);
      await fetchMyOrders(customer?._id);
    } catch (e) {
      toast.error(e?.message || "Cancel failed", { id: toastId });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-3 py-6 md:px-8 md:py-10">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-black">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Track purchases and manage orders.
        </p>
      </div>

      {/* States */}
      {loading ? (
        <div className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-black/60">
          Loading orders…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm font-medium text-black">
          Failed to load orders: <span className="text-black/60">{error}</span>
        </div>
      ) : myOrders.length === 0 ? (
        <div className="rounded-2xl bg-black/[0.03] px-4 py-8 text-center">
          <p className="text-black font-medium">No orders yet.</p>
          <p className="mt-1 text-sm text-black/50">
            When you place an order, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myOrders.map((order) => {
            const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-black/[0.02] p-4 shadow-[0_10px_28px_-22px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_36px_-26px_rgba(0,0,0,0.45)] transition-shadow"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black truncate">
                      Order{" "}
                      {order.orderNumber
                        ? `#${order.orderNumber}`
                        : `#${String(order._id).slice(-6)}`}
                    </p>
                    <p className="mt-0.5 text-xs text-black/50">
                      {formatDate(order.orderDate || order.createdAt)}
                    </p>
                  </div>
                  <span className={pillClass(order.fulfillmentStatus)}>
                    {prettyStatus(order.fulfillmentStatus)}
                  </span>
                </div>

                {/* Items (only 2 for compact mobile) */}
                <div className="mt-4 space-y-3">
                  {items.slice(0, 2).map((item, idx) => {
                    const title =
                      item?.productSnapshot?.title ||
                      item?.productId?.title ||
                      "Product";

                    const thumb =
                      item?.productSnapshot?.thumbnail ||
                      item?.productId?.thumbnail ||
                      "/placeholder.png";

                    const qty = item.quantity ?? 1;
                    const price = item.price ?? 0;

                    return (
                      <div
                        key={item.lineId || idx}
                        className="flex items-center gap-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={title}
                          className="h-14 w-12 rounded-xl bg-black/[0.06] object-cover"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black truncate">
                            {title}
                          </p>
                          <p className="mt-0.5 text-xs text-black/50">
                            Qty: {qty} × ₹{price}
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-black/90">
                          ₹{price}
                        </p>
                      </div>
                    );
                  })}

                  {items.length > 2 ? (
                    <p className="text-[11px] text-black/45">
                      + {items.length - 2} more item(s)
                    </p>
                  ) : null}
                </div>

                {/* Bottom */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-black/60">
                    Total:{" "}
                    <span className="font-semibold text-black">
                      ₹{order.finalPayable ?? order.totalAmount ?? 0}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/profile/orders/${order._id}`)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm hover:bg-black/[0.04] transition"
                    >
                      View Details
                    </button>

                    {statusKey === "delivered" ? (
                      <button
                        onClick={() => router.push(`/profile/orders/${order._id}`)}
                        className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                      >
                        Return
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal kept for reuse (not used directly here unless you trigger it elsewhere) */}
      <CancelOrderModal
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setCancelOrder(null);
        }}
        onConfirm={handleCancelConfirm}
        loading={cancelLoading}
        orderNumber={cancelOrder?.orderNumber}
      />
    </section>
  );
}
