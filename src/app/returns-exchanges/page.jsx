"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { RotateCcw, ShieldCheck } from "lucide-react";
import OrderLookupForm from "@/components/returns-exchanges/OrderLookupForm";
import EligibilityCard from "@/components/returns-exchanges/EligibilityCard";
import RequestTypeSelector from "@/components/returns-exchanges/RequestTypeSelector";
import RmaItemSelector from "@/components/returns-exchanges/RmaItemSelector";
import RmaReasonForm from "@/components/returns-exchanges/RmaReasonForm";
import RefundDetailsStep from "@/components/returns-exchanges/RefundDetailsStep";
import RmaReviewSubmit from "@/components/returns-exchanges/RmaReviewSubmit";
import RmaSuccessCard from "@/components/returns-exchanges/RmaSuccessCard";
import useRmaOrderStore from "@/store/RmaOrderStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const clean = (v) => String(v || "").trim();
const lower = (v) => clean(v).toLowerCase();

const getId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || null;
  return null;
};

export default function ReturnsExchangesPage() {
  const [step, setStep] = useState("lookup");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [order, setOrder] = useState(null);

  const [requestType, setRequestType] = useState("exchange");
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("wrong_size");
  const [customerNote, setCustomerNote] = useState("");
  const [exchangeSize, setExchangeSize] = useState("");

  const { createRma, submitting, rma } = useRmaOrderStore();

  const isDelivered = lower(order?.fulfillmentStatus) === "delivered";

  const customerId =
    getId(order?.customerId) ||
    getId(order?.customer) ||
    getId(order?.customerDetails) ||
    getId(order?.userId) ||
    null;

  const customerEmail =
    order?.shippingAddressSnapshot?.email ||
    order?.billingAddressSnapshot?.email ||
    order?.customerId?.email ||
    order?.customer?.email ||
    "";

  const customerPhone =
    order?.shippingAddressSnapshot?.phone ||
    order?.billingAddressSnapshot?.phone ||
    order?.customerId?.phone ||
    order?.customer?.phone ||
    "";

  const selectedPayloadItems = useMemo(
    () =>
      selectedItems.map((item) => ({
        orderLineId: item.lineId,
        quantity: Number(item.rmaQuantity || 1),
      })),
    [selectedItems]
  );

  const handleLookup = async ({ orderNumber, identity }) => {
    setLookupLoading(true);
    setLookupError("");
    setOrder(null);

    try {
      const isEmail = identity.includes("@");
      const params = isEmail ? { email: identity } : { phone: identity };

      const { data } = await axios.get(`${API}/api/orders/lookup`, {
        params,
        withCredentials: true,
      });

      const found = (data?.orders || []).find(
        (o) => lower(o?.orderNumber) === lower(orderNumber)
      );

      if (!found) {
        setLookupError("No matching order found with these details.");
        return;
      }

      setOrder(found);
      setStep("eligibility");
    } catch (err) {
      setLookupError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to verify order."
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      type: requestType,
      reason,
      customerNote,
      items: selectedPayloadItems,
    };

    if (requestType === "exchange") {
      payload.exchangeTo = {
        productId: selectedItems?.[0]?.productId,
        attributes: [{ key: "size", value: exchangeSize }],
        note: `Exchange size to ${exchangeSize}`,
      };
    }

    await createRma(order._id, payload);
    setStep("success");
  };

  const handleReasonContinue = () => {
    if (requestType === "return") {
      setStep("refundDetails");
      return;
    }

    setStep("review");
  };

  const handleReviewBack = () => {
    if (requestType === "return") {
      setStep("refundDetails");
      return;
    }

    setStep("reason");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 text-gray-950 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white">
            <RotateCcw className="h-5 w-5" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
            Return or Exchange Your Order
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Enter your order details to verify eligibility and request a size
            exchange or return for selected products.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-gray-100 px-3 py-1.5">
              Order verification
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1.5">
              Delivered orders only
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1.5">
              Partial or full order
            </span>
          </div>
        </div>

        {step === "lookup" && (
          <OrderLookupForm
            loading={lookupLoading}
            error={lookupError}
            onSubmit={handleLookup}
          />
        )}

        {step === "eligibility" && (
          <EligibilityCard
            order={order}
            isDelivered={isDelivered}
            onBack={() => setStep("lookup")}
            onContinue={() => setStep("type")}
          />
        )}

        {step === "type" && (
          <RequestTypeSelector
            value={requestType}
            onChange={setRequestType}
            onBack={() => setStep("eligibility")}
            onContinue={() => setStep("items")}
          />
        )}

        {step === "items" && (
          <RmaItemSelector
            order={order}
            selectedItems={selectedItems}
            onChange={setSelectedItems}
            onBack={() => setStep("type")}
            onContinue={() => setStep("reason")}
          />
        )}

        {step === "reason" && (
          <RmaReasonForm
            requestType={requestType}
            reason={reason}
            customerNote={customerNote}
            exchangeSize={exchangeSize}
            selectedItems={selectedItems}
            onReasonChange={setReason}
            onNoteChange={setCustomerNote}
            onExchangeSizeChange={setExchangeSize}
            onBack={() => setStep("items")}
            onContinue={handleReasonContinue}
          />
        )}

        {step === "refundDetails" && (
          <RefundDetailsStep
            customerId={customerId}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            onContinue={() => setStep("review")}
          />
        )}

        {step === "review" && (
          <RmaReviewSubmit
            order={order}
            requestType={requestType}
            selectedItems={selectedItems}
            reason={reason}
            customerNote={customerNote}
            exchangeSize={exchangeSize}
            loading={submitting}
            onBack={handleReviewBack}
            onSubmit={handleSubmit}
          />
        )}

        {step === "success" && <RmaSuccessCard rma={rma} />}

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4" />
          Your order details are used only to verify return/exchange
          eligibility.
        </div>
      </section>
    </main>
  );
}