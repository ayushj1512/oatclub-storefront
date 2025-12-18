"use client";

import { notify } from "@/lib/notify";

export default function NotifyTestPage() {
  const dummyProduct = {
    id: 123,
    name: "Black Ribbed Crop Top",
    selectedSize: "M",
    price: 799,
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">
        🔔 Sonner Notify Test
      </h1>

      <p className="text-gray-600 mb-8">
        Click buttons below to test all toast types.
      </p>

      <div className="grid gap-4 max-w-sm">
        {/* BASIC */}
        <button className="btn" onClick={() => notify.success("Success toast!")}>
          Success
        </button>

        <button className="btn" onClick={() => notify.error("Error toast!")}>
          Error
        </button>

        <button className="btn" onClick={() => notify.info("Info toast!")}>
          Info
        </button>

        {/* CART */}
        <button className="btn" onClick={() => notify.cartAdded(dummyProduct)}>
          Cart Added
        </button>

        <button className="btn" onClick={() => notify.cartRemoved(dummyProduct)}>
          Cart Removed
        </button>

        <button
          className="btn"
          onClick={() => notify.cartQtyUpdated(dummyProduct, 2)}
        >
          Cart Qty Updated
        </button>

        <button className="btn" onClick={() => notify.cartCleared()}>
          Cart Cleared
        </button>

        {/* WISHLIST */}
        <button
          className="btn"
          onClick={() => notify.wishlistAdded(dummyProduct)}
        >
          Wishlist Added
        </button>

        <button
          className="btn"
          onClick={() => notify.wishlistRemoved(dummyProduct)}
        >
          Wishlist Removed
        </button>

        {/* COPY */}
        <button className="btn" onClick={() => notify.copied()}>
          Copied
        </button>
      </div>

      {/* Local styles */}
      <style jsx>{`
        .btn {
          padding: 14px 18px;
          border-radius: 999px;
          background: #800020;
          color: white;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease;
          text-align: center;
        }
        .btn:hover {
          background: #6a0018;
        }
      `}</style>
    </div>
  );
}
