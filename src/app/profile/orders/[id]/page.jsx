"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

/* ----------------------------------------------------
    MOCK ORDER DATA — Replace with real API later
---------------------------------------------------- */
const ORDERS = [
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
        availableSizes: ["XS", "S", "M", "L", "XL"],
      },
      {
        id: "P02",
        name: "Classic Denim Jacket",
        size: "L",
        qty: 1,
        price: "₹999",
        image: "/products/jacket1.png",
        availableSizes: ["S", "M", "L", "XL"],
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
        availableSizes: ["S", "M", "L"],
      },
    ],
  },
];

/* ----------------------------------------------------
    STATUS COLORS
---------------------------------------------------- */
const STATUS_COLORS = {
  Delivered: "text-green-600 bg-green-100",
  "In Transit": "text-blue-600 bg-blue-100",
  Cancelled: "text-red-600 bg-red-100",
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const order = ORDERS.find((o) => o.id === id);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(null); // itemId
  const [showReturnModal, setShowReturnModal] = useState(null); // itemId
  const [selectedSize, setSelectedSize] = useState(null);
  const [returnReason, setReturnReason] = useState("");

  if (!order) {
    return (
      <section className="p-10">
        <h1 className="text-2xl font-semibold">Order Not Found</h1>
      </section>
    );
  }

  /* ----------------------------------------------------
      MODALS — Cancel / Exchange / Return
  ---------------------------------------------------- */
  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[99999] p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full relative shadow-lg animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );

  /* ----------------------------------------------------
      MAIN UI
  ---------------------------------------------------- */
  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold mb-6">Order #{order.id}</h1>

      {/* Order Info */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-gray-600">Placed on: {order.date}</p>
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
            STATUS_COLORS[order.status]
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Order Items */}
      <div className="flex flex-col gap-5">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl p-5 flex gap-4 shadow-sm"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-28 rounded-lg bg-gray-100 object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold text-lg">{item.name}</p>
              <p className="text-gray-600 text-sm">Size: {item.size}</p>
              <p className="text-gray-600 text-sm">Qty: {item.qty}</p>
              <p className="text-[#800020] font-semibold mt-1">{item.price}</p>

              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  onClick={() => setShowExchangeModal(item)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                >
                  Exchange Size
                </button>

                <button
                  onClick={() => setShowReturnModal(item)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                >
                  Return Item
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Entire Order */}
      <div className="mt-8">
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600"
        >
          Cancel Entire Order
        </button>
      </div>

      {/* ----------------------------------------------------
          MODAL: CANCEL ORDER
      ---------------------------------------------------- */}
      {showCancelModal && (
        <Modal onClose={() => setShowCancelModal(false)}>
          <h2 className="text-xl font-semibold mb-3">Cancel Order?</h2>
          <p className="text-gray-600 text-sm mb-5">
            Are you sure you want to cancel the full order #{order.id}?
          </p>

          <button
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
            onClick={() => {
              alert("Order cancelled (mock).");
              setShowCancelModal(false);
            }}
          >
            Yes, Cancel Order
          </button>
        </Modal>
      )}

      {/* ----------------------------------------------------
          MODAL: EXCHANGE SIZE
      ---------------------------------------------------- */}
      {showExchangeModal && (
        <Modal onClose={() => setShowExchangeModal(null)}>
          <h2 className="text-xl font-semibold mb-4">Exchange Size</h2>

          <p className="text-gray-600 mb-3">
            Select a new size for: <b>{showExchangeModal.name}</b>
          </p>

          <div className="flex gap-2 flex-wrap mb-5">
            {showExchangeModal.availableSizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-4 py-2 rounded-lg border ${
                  selectedSize === sz
                    ? "bg-[#800020] text-white border-[#800020]"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            disabled={!selectedSize}
            className={`w-full py-3 rounded-lg font-semibold ${
              selectedSize
                ? "bg-[#800020] text-white hover:bg-[#6a001b]"
                : "bg-gray-200 text-gray-400"
            }`}
            onClick={() => {
              alert(`Exchange requested (mock): ${selectedSize}`);
              setShowExchangeModal(null);
            }}
          >
            Submit Exchange
          </button>
        </Modal>
      )}

      {/* ----------------------------------------------------
          MODAL: RETURN REQUEST
      ---------------------------------------------------- */}
      {showReturnModal && (
        <Modal onClose={() => setShowReturnModal(null)}>
          <h2 className="text-xl font-semibold mb-4">Return Item</h2>

          <p className="text-gray-600 mb-3">
            Select a reason for returning:{" "}
            <b>{showReturnModal.name}</b>
          </p>

          <select
            className="w-full border rounded-lg p-3 mb-5"
            onChange={(e) => setReturnReason(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Choose a reason…
            </option>
            <option>Size too small</option>
            <option>Size too large</option>
            <option>Wrong item received</option>
            <option>Damaged product</option>
            <option>Not as described</option>
          </select>

          <button
            disabled={!returnReason}
            className={`w-full py-3 rounded-lg font-semibold ${
              returnReason
                ? "bg-[#800020] text-white hover:bg-[#6a001b]"
                : "bg-gray-200 text-gray-400"
            }`}
            onClick={() => {
              alert(`Return submitted (mock): ${returnReason}`);
              setShowReturnModal(null);
            }}
          >
            Submit Return Request
          </button>
        </Modal>
      )}
    </section>
  );
}
