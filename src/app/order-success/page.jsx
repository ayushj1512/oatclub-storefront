// src/app/order-success/page.jsx
import { Suspense } from "react";
import OrderSuccessClient from "./OrderSuccessClient";

// Server component: wraps client hook usage in Suspense to avoid prerender error
export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}
