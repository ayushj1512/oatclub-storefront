"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

const STATUS_COLORS = {
  processing: "text-yellow-800 bg-yellow-100",
  packed: "text-indigo-800 bg-indigo-100",
  picked: "text-blue-800 bg-blue-100",
  shipped: "text-blue-800 bg-blue-100",
  out_for_delivery: "text-purple-800 bg-purple-100",
  delivered: "text-green-800 bg-green-100",
  return_requested: "text-orange-800 bg-orange-100",
  exchange_requested: "text-orange-800 bg-orange-100",
  returned: "text-gray-900 bg-gray-200",
  rto: "text-black bg-black/10",
  cancelled: "text-red-800 bg-red-100",
};

const CANCEL_ALLOWED = ["processing", "packed", "picked", "shipped"];

function pillClass(status) {
  const key = String(status || "").toLowerCase();
  return `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[key] || "text-gray-700 bg-gray-100"}`;
}

function prettyStatus(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return "Pending";
  return v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "";
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { customer, loading: authLoading, isAuthenticated } = useAuthStore();
  const { orders, fetchMyOrders, updateOrderStatus, loading, error } = useOrderStore();

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
      await updateOrderStatus(cancelOrder._id, { fulfillmentStatus: "cancelled", adminRemarks: reasonText });
      toast.success("✅ Order cancelled successfully!", { id: toastId });
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
    <section className="p-6 md:p-10 bg-white">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <h1 className="mb-8 text-3xl font-semibold text-black">My Orders</h1>

      {loading ? (
        <div className="text-black/60">Loading orders…</div>
      ) : error ? (
        <div className="font-medium text-black">Failed to load orders: {error}</div>
      ) : myOrders.length === 0 ? (
        <div className="text-black/60">No orders yet.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {myOrders.map((order) => {
            const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
            const canCancel = CANCEL_ALLOWED.includes(statusKey);
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div key={order._id} className="rounded-3xl bg-black/[0.03] p-6 shadow-sm hover:shadow-md transition">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-black">Order {order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).slice(-6)}`}</p>
                    <p className="text-sm text-black/50">Placed on {formatDate(order.orderDate || order.createdAt)}</p>
                  </div>
                  <span className={pillClass(order.fulfillmentStatus)}>{prettyStatus(order.fulfillmentStatus)}</span>
                </div>

                <div className="flex flex-col gap-4">
                  {items.slice(0, 3).map((item, idx) => {
                    const title = item?.productSnapshot?.title || item?.productId?.title || "Product";
                    const thumb = item?.productSnapshot?.thumbnail || item?.productId?.thumbnail || "/placeholder.png";
                    const qty = item.quantity ?? 1;
                    const price = item.price ?? 0;
                    const sizeAttr = item?.variant?.attributes?.find((a) => a.key === "size")?.value || null;

                    return (
                      <div key={item.lineId || idx} className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={title} className="h-24 w-20 rounded-2xl bg-black/5 object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-black">{title}</p>
                          {sizeAttr ? <p className="text-sm text-black/50">Size: {sizeAttr}</p> : null}
                          <p className="text-sm text-black/50">Qty: {qty} × ₹{price}</p>
                        </div>
                        <p className="font-semibold text-black/90">₹{price}</p>
                      </div>
                    );
                  })}

                  {items.length > 3 ? <p className="text-xs text-black/50">+ {items.length - 3} more item(s)</p> : null}
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
                  <p className="font-medium text-black/70">Total: <span className="font-semibold text-black">₹{order.finalPayable ?? order.totalAmount ?? 0}</span></p>

                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => router.push(`/profile/orders/${order._id}`)} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm hover:bg-black/5 transition">
                      View Details
                    </button>

                    {statusKey === "delivered" ? (
                      <button onClick={() => router.push(`/profile/orders/${order._id}`)} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                        Return / Exchange
                      </button>
                    ) : null}

                    {canCancel ? (
                      <button onClick={() => openCancelModal(order)} className="rounded-full bg-black/10 px-5 py-2 text-sm font-semibold text-black hover:bg-black/20 transition">
                        Cancel Order
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CancelOrderModal open={cancelOpen} onClose={() => { setCancelOpen(false); setCancelOrder(null); }} onConfirm={handleCancelConfirm} loading={cancelLoading} orderNumber={cancelOrder?.orderNumber} />
    </section>
  );
}
