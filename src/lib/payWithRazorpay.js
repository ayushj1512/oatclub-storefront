import toast from "react-hot-toast";
import { loadRazorpay } from "./loadRazorpay";

export const payWithRazorpay = async ({ mongoOrderId }) => {
  let toastId = null;

  try {
    toastId = toast.loading("Preparing payment...");

    // 1️⃣ Create Razorpay order (backend)
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mongoOrderId }),
    });

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message || "Failed to create Razorpay order", { id: toastId });
      throw new Error(data.message || "Failed to create Razorpay order");
    }

    toast.success("Payment gateway ready!", { id: toastId });

    // 2️⃣ Load SDK
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
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
        let verifyToast = null;

        try {
          verifyToast = toast.loading("Verifying payment...");

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
            toast.success("✅ Payment verified successfully!", { id: verifyToast });
            window.location.href = `/order-success?orderId=${data.mongoOrderId}`;
          } else {
            toast.error("Payment verification failed", { id: verifyToast });
          }
        } catch (err) {
          toast.error(err?.message || "Verification error", { id: verifyToast });
        }
      },

      modal: {
        ondismiss: () => {
          toast("Payment popup closed", { icon: "⚠️" });
        },
      },

      theme: {
        color: "#800020",
      },
    };

    const rzp = new window.Razorpay(options);

    // Optional failure handler
    rzp.on("payment.failed", function (err) {
      toast.error(err?.error?.description || "Payment failed. Please try again.");
    });

    rzp.open();
  } catch (err) {
    toast.error(err?.message || "Payment failed. Try again.");
  } finally {
    if (toastId) toast.dismiss(toastId);
  }
};
