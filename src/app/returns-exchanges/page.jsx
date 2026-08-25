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

const POLICY_POINTS = [
  "Request a return or exchange within 7 days from the date of delivery.",
  "Convenient reverse pick-up is available for eligible returns and exchanges.",
  "A ₹100 return shipping fee will be deducted from approved return refunds.",
  "Exchange your product for any other available product. Any price difference will be adjusted accordingly.",
  "Approved refunds are initiated within 3–4 business days after the returned product is received and verified.",
];

const CONDITIONS = [
  "The product must be unused and unworn.",
  "The product must be returned in its original condition.",
  "All original tags, packaging, and accessories must be intact.",
  "Damaged, altered, washed, or used products may not be eligible.",
  "Returns and exchanges must be requested within 7 days of delivery.",
];

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
      const params = identity.includes("@")
        ? { email: identity }
        : { phone: identity };

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

  const handleReasonContinue = () =>
    setStep(requestType === "return" ? "refundDetails" : "review");

  const handleReviewBack = () =>
    setStep(requestType === "return" ? "refundDetails" : "reason");

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 text-gray-950 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white">
            <RotateCcw className="h-5 w-5" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            OATCLUB Returns
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
            7-Day Easy Exchange & Return Policy
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
            At OATCLUB, we want you to shop with confidence. If you’re not
            completely satisfied with your purchase, you can request an
            exchange or return within 7 days of delivery.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <PolicySection title="Easy Exchange & Return">
              <ul className="space-y-3">
                {POLICY_POINTS.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-gray-600"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-950" />
                    {item}
                  </li>
                ))}
              </ul>
            </PolicySection>

            <PolicySection title="How Returns & Exchanges Work">
              <div className="space-y-3 text-sm leading-6 text-gray-600">
                <p>
                  Once you raise a return or exchange request, our team will
                  arrange a reverse pick-up for the eligible product.
                </p>
                <p>
                  After the product is received, it will undergo a basic
                  quality check. Once approved, your refund will be initiated
                  within 3–4 business days.
                </p>
                <p>
                  For exchanges, your replacement product will be processed
                  after the returned product is received and successfully
                  verified.
                </p>
              </div>
            </PolicySection>

            <PolicySection title="Refund to OATCLUB Wallet">
              <p className="text-sm leading-6 text-gray-600">
                Your approved refund will be credited to your OATCLUB account
                wallet. You can redeem the wallet balance towards future
                orders on the OATCLUB website.
              </p>
            </PolicySection>

            <PolicySection title="Return & Exchange Conditions">
              <ul className="space-y-3">
                {CONDITIONS.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-gray-600"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-950" />
                    {item}
                  </li>
                ))}
              </ul>
            </PolicySection>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Important
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-200">
              The ₹100 return shipping fee will be deducted from the refund
              amount for approved returns. Refunds will be credited to your
              OATCLUB wallet within 3–4 business days after the returned
              product is received and verified.
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              For any questions regarding your return or exchange, please
              contact our customer support team.
            </p>
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
          Your order details are used only to verify return and exchange
          eligibility.
        </div>
      </section>
    </main>
  );
}

function PolicySection({ title, children }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-950">
        {title}
      </h2>
      {children}
    </div>
  );
}
