"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";

const STATUS_COLORS = {
  delivered: "text-green-600 bg-green-100",
  shipped: "text-blue-600 bg-blue-100",
  out_for_delivery: "text-blue-600 bg-blue-100",
  packed: "text-yellow-700 bg-yellow-100",
  processing: "text-yellow-700 bg-yellow-100",
  returned: "text-purple-700 bg-purple-100",
  cancelled: "text-red-600 bg-red-100",
};

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
  const { orders, fetchMyOrders, updateOrderStatus, loading, error } = useOrderStore();

  // Fetch orders + polling for "real-time"
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!customer?._id) return;

    fetchMyOrders(customer._id);
    const interval = setInterval(() => fetchMyOrders(customer._id), 15000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated, customer?._id, fetchMyOrders, router]);

  const myOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list;
  }, [orders]);

 return (
  <section className="p-6 md:p-10 bg-white">
    <h1 className="mb-8 text-3xl font-semibold text-black">My Orders</h1>

    {loading ? (
      <div className="text-black/60">Loading orders…</div>
    ) : error ? (
      <div className="font-medium text-black">
        Failed to load orders: {error}
      </div>
    ) : myOrders.length === 0 ? (
      <div className="text-black/60">No orders yet.</div>
    ) : (
      <div className="flex flex-col gap-6">
        {myOrders.map((order) => {
          const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
          const canCancel = ["processing", "packed"].includes(statusKey);
          const items = Array.isArray(order.items) ? order.items : [];

          return (
            <div
              key={order._id}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Header */}
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-black">
                    Order{" "}
                    {order.orderNumber
                      ? `#${order.orderNumber}`
                      : `#${String(order._id).slice(-6)}`}
                  </p>
                  <p className="text-sm text-black/50">
                    Placed on {formatDate(order.orderDate || order.createdAt)}
                  </p>
                </div>

                <span className={pillClass(order.fulfillmentStatus)}>
                  {prettyStatus(order.fulfillmentStatus)}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-4">
                {items.slice(0, 3).map((item, idx) => {
                  const prod = item.productId || {};
                  const title =
                    item.name || prod.title || prod.name || "Product";
                  const thumb = prod.thumbnail || "/placeholder.png";
                  const qty = item.quantity ?? 1;
                  const price = item.price ?? 0;
                  const size =
                    item?.variant?.size ||
                    item?.variant?.attributes?.size ||
                    null;

                  return (
                    <div
                      key={prod._id || idx}
                      className="flex items-center gap-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={title}
                        className="h-24 w-20 rounded-lg bg-black/5 object-cover"
                      />

                      <div className="flex-1">
                        <p className="font-medium text-black">{title}</p>
                        {size && (
                          <p className="text-sm text-black/50">
                            Size: {size}
                          </p>
                        )}
                        <p className="text-sm text-black/50">
                          Qty: {qty} × ₹{price}
                        </p>
                      </div>

                      <p className="font-semibold text-black/90">
                        ₹{price}
                      </p>
                    </div>
                  );
                })}

                {items.length > 3 && (
                  <p className="text-xs text-black/50">
                    + {items.length - 3} more item(s)
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-5 md:flex-row md:items-center md:justify-between">
                <p className="font-medium text-black/70">
                  Total:{" "}
                  <span className="font-semibold text-black">
                    ₹{order.finalPayable ?? order.totalAmount ?? 0}
                  </span>
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* View */}
                  <button
                    onClick={() =>
                      router.push(`/profile/orders/${order._id}`)
                    }
                    className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5"
                  >
                    View Details
                  </button>

                  {/* Delivered → Return / Exchange */}
                  {statusKey === "delivered" && (
                    <button
                      onClick={() =>
                        router.push(`/rma?order=${order._id}`)
                      }
                      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Return / Exchange
                    </button>
                  )}

                  {/* Cancel */}
                  {canCancel && (
                    <button
                      onClick={async () => {
                        try {
                          await updateOrderStatus(order._id, {
                            fulfillmentStatus: "cancelled",
                          });
                        } catch (e) {
                          alert(e.message || "Cancel failed");
                        }
                      }}
                      className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
                    >
                      Cancel Order
                    </button>
                  )}
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
