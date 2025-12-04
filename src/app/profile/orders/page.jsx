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
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold mb-8">My Orders</h1>

      {loading ? (
        <div className="text-gray-600">Loading orders...</div>
      ) : error ? (
        <div className="text-red-600 font-medium">Failed to load orders: {error}</div>
      ) : myOrders.length === 0 ? (
        <div className="text-gray-600">No orders yet.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {myOrders.map((order) => {
            const statusKey = String(order.fulfillmentStatus || "").toLowerCase();
            const statusClass = STATUS_COLORS[statusKey] || "text-gray-700 bg-gray-100";

            const canCancel = ["processing", "packed"].includes(statusKey);

            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div
                key={order._id}
                className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <p className="font-semibold text-lg">
                      Order {order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).slice(-6)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.orderDate || order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
                  >
                    {prettyStatus(order.fulfillmentStatus)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="flex flex-col gap-4">
                  {items.slice(0, 3).map((item, idx) => {
                    const prod = item.productId || {};
                    const title = item.name || prod.title || prod.name || "Product";
                    const thumb = prod.thumbnail || "/placeholder.png";
                    const qty = item.quantity ?? 1;
                    const price = item.price ?? 0;
                    const size = item?.variant?.size || item?.variant?.attributes?.size || null;

                    return (
                      <div key={prod._id || idx} className="flex gap-4 items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={title}
                          className="w-20 h-24 object-cover rounded-lg bg-gray-100"
                        />

                        <div className="flex-1">
                          <p className="font-medium">{title}</p>
                          {size ? <p className="text-sm text-gray-500">Size: {size}</p> : null}
                          <p className="text-sm text-gray-500">Qty: {qty} × ₹{price}</p>
                        </div>

                        <p className="font-semibold text-gray-800">₹{price}</p>
                      </div>
                    );
                  })}

                  {items.length > 3 ? (
                    <p className="text-xs text-gray-500">+ {items.length - 3} more item(s)</p>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mt-5 pt-5 border-t">
                  <p className="font-medium text-gray-700">
                    Total:{" "}
                    <span className="text-[#800020] font-semibold">
                      ₹{order.finalPayable ?? order.totalAmount ?? 0}
                    </span>
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    {/* View Details */}
                    <button
                      onClick={() => router.push(`/profile/orders/${order._id}`)}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                    >
                      View Details
                    </button>

                    {/* Delivered → Return/Exchange (UI route) */}
                    {statusKey === "delivered" && (
                      <button
                        onClick={() => router.push(`/rma?order=${order._id}`)}
                        className="px-4 py-2 bg-[#800020] text-white rounded-lg text-sm hover:bg-[#6a001b]"
                      >
                        Return / Exchange
                      </button>
                    )}

                    {/* Before shipped → Cancel */}
                    {canCancel && (
                      <button
                        onClick={async () => {
                          try {
                            await updateOrderStatus(order._id, { fulfillmentStatus: "cancelled" });
                          } catch (e) {
                            alert(e.message || "Cancel failed");
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
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
