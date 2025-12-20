import { loadRazorpay } from "./loadRazorpay";

export const payWithRazorpay = async ({ mongoOrderId }) => {
  // 1️⃣ Create Razorpay order (backend)
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mongoOrderId }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to create Razorpay order");
  }

  // 2️⃣ Load SDK
  const loaded = await loadRazorpay();
  if (!loaded) {
    throw new Error("Razorpay SDK failed to load");
  }

  // 3️⃣ Configure checkout
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: data.amount,
    currency: data.currency,
    name: "Miray Fashion",
    description: "Order Payment",
    order_id: data.razorpayOrderId,

    prefill: {
      name: data.customer?.name || "",
      email: data.customer?.email || "",
      contact: data.customer?.phone || "",
    },

    handler: async function (response) {
      // 4️⃣ Verify payment (backend)
      const verifyRes = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mongoOrderId: data.mongoOrderId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        window.location.href = `/order-success?orderId=${data.mongoOrderId}`;
      } else {
        alert("Payment verification failed");
      }
    },

    modal: {
      ondismiss: async () => {
        // Optional: mark failed or allow retry
        console.log("Payment popup closed");
      },
    },

    theme: {
      color: "#800020",
    },
  };

  const rzp = new window.Razorpay(options);

  // Optional failure handler
  rzp.on("payment.failed", function () {
    alert("Payment failed. Please try again.");
  });

  rzp.open();
};
