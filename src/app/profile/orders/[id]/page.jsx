    "use client";

import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();

  return (
    <section className="p-10">
      <h1 className="text-3xl font-semibold mb-6">Order #{id}</h1>
      <p className="text-gray-600">
        Thank you for shopping with Miray Fashions. Your order details will appear here.
      </p>
    </section>
  );
}
