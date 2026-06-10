"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { X } from "lucide-react";

import OrderItemReviewSection from "@/components/reviews/OrderItemReviewSection";
import ReturnFileModal from "@/components/profile/ReturnFileModal";
import ReturnExchangeBanner from "@/components/profile/ReturnExchangeBanner";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import OrderProductTimeline from "@/components/profile/OrderProductTimeline";

import OrderDetailsShell from "@/components/profile/order-details/OrderDetailsShell";
import OrderDetailsHeader from "@/components/profile/order-details/OrderDetailsHeader";
import OrderStatusHero from "@/components/profile/order-details/OrderStatusHero";
import OrderPaymentSummary from "@/components/profile/order-details/OrderPaymentSummary";
import OrderAddressCards from "@/components/profile/order-details/OrderAddressCards";
import OrderShipmentCard from "@/components/profile/order-details/OrderShipmentCard";
import OrderItemsList from "@/components/profile/order-details/OrderItemsList";
import OrderRmaRequests from "@/components/profile/order-details/OrderRmaRequests";
import OrderRemarkCard from "@/components/profile/order-details/OrderRemarkCard";
import OrderSupportCard from "@/components/profile/order-details/OrderSupportCard";

import {
  CANCEL_ALLOWED,
  RMA_ALLOWED,
  s,
  formatDateIST,
  getDeliveredAtFromOrder,
  computeRmaWindow,
} from "@/components/profile/order-details/orderDetailsUtils";

import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useRmaStore } from "@/store/useRmaStore";
import { useReviewStore } from "@/store/useReviewStore";

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-6">
    <div className="relative w-full rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full bg-black/5 p-2 transition hover:bg-black/10"
        aria-label="Close"
      >
        <X size={18} />
      </button>
      {children}
    </div>
  </div>
);

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    customer,
    loading: authLoading,
    isAuthenticated,
    token,
    updateCustomerPayoutDetails,
  } = useAuthStore();

  const {
    order,
    fetchOrderById,
    fetchOrderByNumber,
    updateOrderStatus,
    cancelOrder,
    loading: orderLoading,
    error: orderError,
  } = useOrderStore();

  const { rmas, fetchRmasByOrder, createRma, error: rmaError } = useRmaStore();

  const [initialLoaded, setInitialLoaded] = useState(false);

  const [reviewedByLineId, setReviewedByLineId] = useState({});
  const [checkingReviews, setCheckingReviews] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [remarkDraft, setRemarkDraft] = useState("");
  const [savingRemark, setSavingRemark] = useState(false);

  const [openReviewLineId, setOpenReviewLineId] = useState(null);
  const [returnModal, setReturnModal] = useState(null);

  const [nowMs] = useState(() => Date.now());

  const reviewStore = useReviewStore();
  const shouldOpenReview = searchParams.get("review") === "1";

  const reviewCheckFn =
    reviewStore?.checkReviewed ||
    reviewStore?.hasReviewed ||
    reviewStore?.isReviewed ||
    reviewStore?.getMyReviewByProduct ||
    reviewStore?.fetchMyReviewByProduct ||
    null;

  const isOrderNumber = useMemo(() => {
    const value = String(id || "").trim().toUpperCase();
    return value.startsWith("MIRAY-");
  }, [id]);

  const refetchOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return null;

      try {
        const res =
          isOrderNumber && typeof fetchOrderByNumber === "function"
            ? await fetchOrderByNumber(id, { silent })
            : await fetchOrderById(id, { silent });

        setInitialLoaded(true);
        return res;
      } catch (err) {
        setInitialLoaded(true);
        throw err;
      }
    },
    [id, isOrderNumber, fetchOrderById, fetchOrderByNumber]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!id) return;

    let alive = true;

    const run = async () => {
      if (!alive) return;

      try {
        await refetchOrder({ silent: false });
      } catch {}
    };

    run();

    const interval = setInterval(() => {
      if (!alive) return;

      refetchOrder({ silent: true }).catch(() => {});
    }, 15000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [authLoading, isAuthenticated, id, router, refetchOrder]);

  useEffect(() => {
    if (!order?._id) return;
    fetchRmasByOrder(order._id);
  }, [order?._id, fetchRmasByOrder]);

  useEffect(() => {
    if (order?.customerSupportRemark != null) {
      setRemarkDraft(String(order.customerSupportRemark));
    }
  }, [order?._id, order?.customerSupportRemark]);

  const safeItems = useMemo(() => {
    const list = order?.items || [];
    return Array.isArray(list) ? list : [];
  }, [order?._id, order?.items?.length]);

  const statusKey = useMemo(
    () => String(order?.fulfillmentStatus || "").toLowerCase(),
    [order?.fulfillmentStatus]
  );

  const canCancel = useMemo(
    () => CANCEL_ALLOWED.includes(statusKey),
    [statusKey]
  );

  const canShowRma = useMemo(() => RMA_ALLOWED.includes(statusKey), [statusKey]);

  const deliveredAt = useMemo(() => getDeliveredAtFromOrder(order), [order]);

  const deliveredDateText = useMemo(
    () => formatDateIST(deliveredAt),
    [deliveredAt]
  );

  const rmaWindow = useMemo(
    () => computeRmaWindow(deliveredAt, nowMs, 7),
    [deliveredAt, nowMs]
  );

  const rmaEnabled = useMemo(
    () => canShowRma && rmaWindow.isAllowed,
    [canShowRma, rmaWindow.isAllowed]
  );

  const isOwner = useMemo(() => {
    if (!order || !customer?._id) return true;

    const oid = order?.customerId?._id || order?.customerId;
    return String(oid) === String(customer._id);
  }, [order, customer?._id]);

  const storageKeyFor = useCallback(
    (pid) => {
      const cid = s(customer?._id);
      const p = s(pid);

      if (!cid || !p) return "";
      return `review_submitted:${cid}:${p}`;
    },
    [customer?._id]
  );

  const markReviewed = useCallback(
    (lineId, productId) => {
      setReviewedByLineId((prev) => ({
        ...prev,
        [String(lineId)]: true,
      }));

      const k = storageKeyFor(productId);

      if (k) {
        try {
          sessionStorage.setItem(k, "1");
        } catch {}
      }
    },
    [storageKeyFor]
  );

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!order?._id || !customer?._id || !safeItems.length) return;

      setCheckingReviews(true);

      const nextMap = {};

      for (const item of safeItems) {
        if (!alive) return;

        const lineKey = String(item?.lineId || "");
        const pid = item?.productId?._id || item?.productId;

        if (!lineKey || !pid) continue;

        const k = storageKeyFor(pid);

        if (k) {
          try {
            if (sessionStorage.getItem(k) === "1") {
              nextMap[lineKey] = true;
              continue;
            }
          } catch {}
        }

        if (typeof reviewCheckFn === "function") {
          try {
            const out =
              reviewCheckFn.length >= 1
                ? await reviewCheckFn({
                    token,
                    productId: pid,
                    customerId: customer._id,
                  })
                : await reviewCheckFn(pid);

            const reviewed =
              out === true ||
              (!!out &&
                typeof out === "object" &&
                (out._id || out.review || out.data));

            if (reviewed) {
              nextMap[lineKey] = true;

              if (k) {
                try {
                  sessionStorage.setItem(k, "1");
                } catch {}
              }
            }
          } catch {}
        }
      }

      if (!alive) return;

      setReviewedByLineId((prev) => ({
        ...prev,
        ...nextMap,
      }));

      setCheckingReviews(false);
    };

    run();

    return () => {
      alive = false;
    };
    // intentionally not adding safeItems/reviewCheckFn to avoid repeat review checks on every order refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id, customer?._id]);

  useEffect(() => {
    if (!shouldOpenReview || statusKey !== "delivered" || openReviewLineId || !safeItems.length) {
      return;
    }

    const firstPendingIndex = safeItems.findIndex((item, index) => {
      const lineKey = String(item?.lineId || index);
      return !reviewedByLineId[lineKey];
    });

    if (firstPendingIndex >= 0) {
      setOpenReviewLineId(safeItems[firstPendingIndex]?.lineId || firstPendingIndex);
      window.setTimeout(() => {
        document.getElementById("order-items-review-area")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 250);
    }
  }, [shouldOpenReview, statusKey, openReviewLineId, safeItems, reviewedByLineId]);

  const createReturnRma = async ({ item, reason }) => {
    let toastId = null;

    try {
      if (!item?.lineId) throw new Error("Return item missing");
      if (!s(reason)) throw new Error("Return reason missing");

      setSubmitting(true);
      toastId = toast.loading("Submitting return request...");

      await createRma(order._id, {
        type: "return",
        reason: "other",
        customerNote: reason,
        items: [{ orderLineId: item.lineId, quantity: 1 }],
      });

      toast.success("Return request created!", { id: toastId });
      setReturnModal(null);

      await fetchRmasByOrder(order._id);
      await refetchOrder({ silent: true });
    } catch (e) {
      toast.error(e?.message || "Failed to create return request", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitExchange = async (item) => {
    let toastId = null;

    try {
      setSubmitting(true);
      toastId = toast.loading("Submitting exchange request...");

      await createRma(order._id, {
        type: "exchange",
        reason: "wrong_size",
        customerNote: `Exchange size to ${selectedSize}`,
        items: [{ orderLineId: item.lineId, quantity: 1 }],
        exchangeTo: {
          productId: item.productId?._id || item.productId,
          variantId: item.variant?.variantId,
          variantSku: item.variant?.sku || "",
          attributes: [{ key: "size", value: selectedSize }],
          note: `Requested size: ${selectedSize}`,
        },
      });

      toast.success("Exchange request created!", { id: toastId });

      setShowExchangeModal(null);
      setSelectedSize(null);

      await fetchRmasByOrder(order._id);
      await refetchOrder({ silent: true });
    } catch (e) {
      toast.error(e?.message || "Failed to create exchange request", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async (reasonText = "") => {
    let toastId = null;

    try {
      if (!order?._id) throw new Error("Order not found");

      setSubmitting(true);
      toastId = toast.loading("Cancelling your order...");

      await cancelOrder(order._id, reasonText);

      toast.success("Order cancelled successfully!", { id: toastId });

      setShowCancelModal(false);
      await refetchOrder({ silent: true });
    } catch (e) {
      toast.error(e?.message || "Cancel failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const saveOrderRemark = async () => {
    let toastId = null;

    try {
      if (!order?._id) return;

      setSavingRemark(true);
      toastId = toast.loading("Saving remark...");

      await updateOrderStatus(order._id, {
        customerSupportRemark: remarkDraft,
      });

      toast.success("Remark saved", { id: toastId });
      await refetchOrder({ silent: true });
    } catch (e) {
      toast.error(e?.message || "Failed to save remark", { id: toastId });
    } finally {
      setSavingRemark(false);
    }
  };

  if (authLoading || (orderLoading && !initialLoaded && !order)) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-4 sm:p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <p className="text-gray-500">Loading order...</p>
      </section>
    );
  }

  if (orderError) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-4 sm:p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          <p className="font-semibold text-red-600">
            Failed to load order: {orderError}
          </p>

          <button
            type="button"
            onClick={() => refetchOrder({ silent: false })}
            className="mt-4 w-full rounded-2xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-xl font-semibold">Order Not Found</h1>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="min-h-screen bg-[#F7F7FA] p-6">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <h1 className="text-xl font-semibold">Not Allowed</h1>
        <p className="mt-2 text-sm text-gray-500">
          This order doesn’t belong to your account.
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F7F7FA] px-3 py-4 sm:px-6 sm:py-6 max-w-5xl mx-auto">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <OrderDetailsShell>
        <OrderDetailsHeader
          order={order}
          router={router}
          statusKey={statusKey}
          deliveredDateText={deliveredDateText}
          canCancel={canCancel}
          onCancel={() => canCancel && setShowCancelModal(true)}
        />

        <OrderStatusHero
          order={order}
          statusKey={statusKey}
          safeItems={safeItems}
          rmaEnabled={rmaEnabled}
          rmaWindow={rmaWindow}
        />

        {statusKey === "delivered" ? (
          <ReturnExchangeBanner order={order} />
        ) : null}

        <OrderProductTimeline order={order} />

        <div id="order-items-review-area">
          <OrderItemsList
            items={safeItems}
          statusKey={statusKey}
          canShowRma={canShowRma}
          rmaEnabled={rmaEnabled}
          reviewedByLineId={reviewedByLineId}
          checkingReviews={checkingReviews}
          openReviewLineId={openReviewLineId}
          setOpenReviewLineId={setOpenReviewLineId}
          markReviewed={markReviewed}
          customer={customer}
          setShowExchangeModal={setShowExchangeModal}
          setReturnModal={setReturnModal}
          OrderItemReviewSection={OrderItemReviewSection}
          />
        </div>

        <OrderPaymentSummary order={order} />

        <OrderAddressCards order={order} />

        <OrderShipmentCard order={order} />

        <OrderRmaRequests rmas={rmas} />

        <OrderRemarkCard
          remarkDraft={remarkDraft}
          setRemarkDraft={setRemarkDraft}
          savingRemark={savingRemark}
          onSave={saveOrderRemark}
        />

        <OrderSupportCard order={order} />
      </OrderDetailsShell>

      <CancelOrderModal
        open={showCancelModal}
        order={order}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        loading={submitting}
      />

      {showExchangeModal ? (
        <Modal
          onClose={() => {
            setShowExchangeModal(null);
            setSelectedSize(null);
          }}
        >
          <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">
            Exchange Size
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Select new size for{" "}
            <span className="font-semibold text-gray-900">
              {showExchangeModal.name}
            </span>
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            {showExchangeModal.availableSizes.map((sz) => (
              <button
                type="button"
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  selectedSize === sz
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selectedSize || submitting}
            onClick={() => submitExchange(showExchangeModal.item)}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
              selectedSize
                ? "bg-black text-white hover:opacity-90"
                : "cursor-not-allowed bg-black/10 text-black/40"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Exchange"}
          </button>
        </Modal>
      ) : null}

      <ReturnFileModal
        open={!!returnModal}
        onClose={() => setReturnModal(null)}
        item={returnModal?.item}
        itemName={returnModal?.name || "Item"}
        customer={customer}
        loading={submitting}
        onSavePayout={async (payload) =>
          await updateCustomerPayoutDetails(payload)
        }
        onSubmitReturn={async ({ item, reason }) => {
          await createReturnRma({ item, reason });
        }}
      />

      {rmaError ? (
        <p className="mt-6 text-center text-sm font-medium text-red-600">
          RMA Error: {rmaError}
        </p>
      ) : null}
    </section>
  );
}
