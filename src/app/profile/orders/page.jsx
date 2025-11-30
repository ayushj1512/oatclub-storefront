"use client";

import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  // Mock order data
  const mockOrders = [
    {
      id: "1001",
      date: "10 Nov 2025",
      status: "Delivered",
      total: "₹2,499",
      items: [
        {
          id: "P01",
          name: "Women's Floral Dress",
          size: "M",
          qty: 1,
          price: "₹1,499",
          image: "/products/dress1.png",
        },
        {
          id: "P02",
          name: "Classic Denim Jacket",
          size: "L",
          qty: 1,
          price: "₹999",
          image: "/products/jacket1.png",
        },
      ],
    },

    {
      id: "1002",
      date: "05 Nov 2025",
      status: "In Transit",
      total: "₹1,299",
      items: [
        {
          id: "P04",
          name: "Beige Knit Sweater",
          size: "M",
          qty: 1,
          price: "₹1,299",
          image: "/products/knit1.png",
        },
      ],
    },
  ];

  const statusColor = {
    Delivered: "text-green-600 bg-green-100",
    "In Transit": "text-blue-600 bg-blue-100",
    Cancelled: "text-red-600 bg-red-100",
  };

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold mb-8">My Orders</h1>

      <div className="flex flex-col gap-6">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
          >
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div>
                <p className="font-semibold text-lg">Order #{order.id}</p>
                <p className="text-sm text-gray-500">Placed on {order.date}</p>
              </div>

              <span
                className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            {/* Order Items */}
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg bg-gray-100"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.qty} × {item.price}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-800">{item.price}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-5 pt-5 border-t">
              <p className="font-medium text-gray-700">
                Total: <span className="text-[#800020]">{order.total}</span>
              </p>

              <div className="flex gap-3">
                {/* View Details */}
                <button
                  onClick={() => router.push(`/profile/orders/${order.id}`)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                >
                  View Details
                </button>

                {/* CONDITIONAL BUTTON LOGIC */}

                {/* 🎯 Delivered → Show Return / Exchange */}
                {order.status === "Delivered" && (
                  <button
                    onClick={() => router.push(`/rma?order=${order.id}`)}
                    className="px-4 py-2 bg-[#800020] text-white rounded-lg text-sm hover:bg-[#6a001b]"
                  >
                    Return / Exchange
                  </button>
                )}

                {/* 🚚 In Transit → Show Cancel Order */}
                {order.status === "In Transit" && (
                  <button
                    onClick={() => alert("Cancel request submitted!")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
 