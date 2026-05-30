"use client";

import Image from "next/image";
import { Star, RotateCcw } from "lucide-react";

import { money } from "./orderDetailsUtils";

function DetailChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-gray-700">
      {children}
    </span>
  );
}

export default function OrderItemsList({
  items = [],
  statusKey,

  canShowRma,
  rmaEnabled,

  reviewedByLineId,
  checkingReviews,

  openReviewLineId,
  setOpenReviewLineId,

  markReviewed,

  customer,

  setShowExchangeModal,
  setReturnModal,

  OrderItemReviewSection,
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">
          Products
        </p>

        <h2 className="mt-1 text-xl font-black text-gray-950">
          Order Items
        </h2>
      </div>

      {items.map((item, index) => {
        const snap =
          item?.productSnapshot || {};

        const variant =
          item?.variant || {};

        const title =
          snap?.title || "Product";

        const image =
          snap?.thumbnail ||
          "/placeholder.png";

        const lineKey =
          item?.lineId || index;

        const size =
          item?.selectedSize ||
          variant?.attributes?.find(
            (a) =>
              String(a?.key).toLowerCase() ===
              "size"
          )?.value;

        const color =
          item?.selectedColor ||
          variant?.attributes?.find(
            (a) =>
              String(a?.key).toLowerCase() ===
              "color"
          )?.value;

        const open =
          openReviewLineId === lineKey;

        const alreadyReviewed =
          !!reviewedByLineId[
            String(lineKey)
          ];

        const canWriteReview =
          statusKey === "delivered" &&
          !alreadyReviewed;

        return (
          <div
            key={lineKey}
            className="overflow-hidden rounded-[1.7rem] bg-white shadow-sm ring-1 ring-black/[0.04]"
          >
            <div className="p-4 sm:p-5">
              <div className="flex gap-4">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <div>
                      <h3 className="line-clamp-2 text-base font-black text-gray-950">
                        {title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        SKU:{" "}
                        {variant?.sku ||
                          snap?.sku ||
                          "-"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {size ? (
                          <DetailChip>
                            Size: {size}
                          </DetailChip>
                        ) : null}

                        {color ? (
                          <DetailChip>
                            Color: {color}
                          </DetailChip>
                        ) : null}

                        <DetailChip>
                          Qty:{" "}
                          {item?.quantity || 1}
                        </DetailChip>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500">
                        Price
                      </p>

                      <p className="text-xl font-black text-gray-950">
                        ₹
                        {money(
                          item?.price || 0
                        )}
                      </p>

                      <p className="text-xs text-gray-500">
                        Subtotal ₹
                        {money(
                          item?.subtotal || 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <button
                  onClick={() => {
                    if (
                      alreadyReviewed
                    )
                      return;

                    setOpenReviewLineId(
                      (prev) =>
                        prev === lineKey
                          ? null
                          : lineKey
                    );
                  }}
                  disabled={
                    !canWriteReview
                  }
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    canWriteReview
                      ? "bg-black text-white hover:opacity-90"
                      : "cursor-not-allowed bg-black/5 text-black/35"
                  }`}
                >
                  <Star size={15} />

                  {alreadyReviewed
                    ? "Reviewed"
                    : checkingReviews
                    ? "Checking..."
                    : "Write Review"}
                </button>

                {canShowRma ? (
                  <>
                    <button
                      disabled={
                        !rmaEnabled
                      }
                      onClick={() =>
                        setShowExchangeModal(
                          {
                            item,
                            name: title,
                            availableSizes:
                              [
                                "XS",
                                "S",
                                "M",
                                "L",
                                "XL",
                              ],
                          }
                        )
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        rmaEnabled
                          ? "bg-black text-white hover:opacity-90"
                          : "cursor-not-allowed bg-black/5 text-black/35"
                      }`}
                    >
                      Exchange
                    </button>

                    <button
                      disabled={
                        !rmaEnabled
                      }
                      onClick={() =>
                        setReturnModal({
                          item,
                          name: title,
                        })
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        rmaEnabled
                          ? "bg-black/[0.05] text-gray-900 hover:bg-black/[0.08]"
                          : "cursor-not-allowed bg-black/5 text-black/35"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <RotateCcw size={15} />
                        Return
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <div />
                    <div />
                  </>
                )}
              </div>

              <OrderItemReviewSection
                open={
                  open &&
                  !alreadyReviewed
                }
                onToggle={(next) =>
                  setOpenReviewLineId(
                    next
                      ? lineKey
                      : null
                  )
                }
                delivered={
                  statusKey ===
                  "delivered"
                }
                customerId={
                  customer?._id
                }
                productId={
                  item?.productId?._id ||
                  item?.productId
                }
                productCode={
                  snap?.productCode ||
                  ""
                }
                productName={title}
                verifiedPurchase={
                  statusKey ===
                  "delivered"
                }
                onSubmitted={() =>
                  markReviewed(
                    lineKey,
                    item?.productId?._id ||
                      item?.productId
                  )
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}