"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";

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

const getOrderUrlId = (order) => order?.orderNumber || order?._id;

const prettyStatus = (status) =>
  String(status || "Pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const pillClass = (status) =>
  `inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
    STATUS_COLORS[String(status || "").toLowerCase()] ||
    "text-gray-800 bg-gray-100"
  }`;

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { customer, loading: authLoading, isAuthenticated } = useAuthStore();
  const { orders, fetchMyOrders, loading, error } = useOrderStore();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return router.push("/auth/login");
    if (!customer?._id) return;

    fetchMyOrders(customer._id);

    const interval = setInterval(() => fetchMyOrders(customer._id), 15000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, customer?._id, fetchMyOrders, router]);

  const myOrders = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);

  const goToOrder = (order) => {
    const orderUrlId = getOrderUrlId(order);
    if (!orderUrlId) return;
    router.push(`/profile/orders/${orderUrlId}`);
  };

  return (
    <section className="min-h-screen bg-white px-3 py-6 md:px-8 md:py-10">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Track purchases and manage orders.
        </p>
      </div>

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
          <p className="font-medium text-black">No orders yet.</p>
          <p className="mt-1 text-sm text-black/50">
            When you place an order, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myOrders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
            const total = order.finalPayable ?? order.totalAmount ?? 0;

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-black/[0.02] p-4 shadow-[0_10px_28px_-22px_rgba(0,0,0,0.35)] transition hover:shadow-[0_16px_36px_-26px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-black">
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

                    const qty = item?.quantity ?? 1;
                    const price = item?.price ?? 0;

                    return (
                      <div
                        key={item?.lineId || idx}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={thumb}
                          alt={title}
                          className="h-14 w-12 rounded-xl bg-black/[0.06] object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-black">
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

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-black/60">
                    Total:{" "}
                    <span className="font-semibold text-black">₹{total}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToOrder(order)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm transition hover:bg-black/[0.04]"
                    >
                      View Details
                    </button>

                    {statusKey === "delivered" ? (
                      <button
                        onClick={() => goToOrder(order)}
                        className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
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
    </section>
  );
}