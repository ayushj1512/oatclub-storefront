"use client";

export default function OrdersPage() {
  const mockOrders = [
    { id: "1001", date: "10 Nov 2025", total: "₹2,499", status: "Delivered" },
    { id: "1002", date: "05 Nov 2025", total: "₹1,299", status: "In Transit" },
  ];

  return (
    <section className="p-10">
      <h1 className="text-3xl font-semibold mb-8">My Orders</h1>
      <div className="flex flex-col gap-4">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded-2xl p-5 flex flex-col md:flex-row md:justify-between"
          >
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-sm text-gray-500">Placed on {order.date}</p>
            </div>
            <div className="flex flex-col md:items-end">
              <p className="text-gray-600">Total: {order.total}</p>
              <p className="text-sm text-pink-600 font-semibold">
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
