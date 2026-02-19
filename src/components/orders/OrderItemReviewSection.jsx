// components/reviews/OrderItemReviewSection.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Star, Image as ImageIcon, UploadCloud, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useAdminMediaStore } from "@/store/adminMediaStore";
import { useReviewStore } from "@/store/useReviewStore";

const safe = (v) => (v == null ? "" : String(v));
const s = (v) => safe(v).trim();

function StarPicker({ value, onChange, disabled }) {
  const v = Math.max(1, Math.min(5, Number(value) || 5));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < v;
        return (
          <button
            type="button"
            key={i}
            disabled={disabled}
            onClick={() => onChange(i + 1)}
            className="p-1 disabled:opacity-50"
            aria-label={`${i + 1} star`}
          >
            <Star
              className={`h-6 w-6 ${
                active ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function OrderItemReviewSection({
  open,
  onToggle,
  delivered = false,

  // required for review payload
  customerId,
  productId,
  productCode = "",
  productName = "Product",

  verifiedPurchase = true,

  // optional (if you want to disable when already reviewed)
  disabled = false,
}) {
  const { createReview } = useReviewStore();

  const {
    fetchMedia,
    uploadMedia,
    items: mediaItems,
    loading: mediaLoading,
    uploading: mediaUploading,
    page: mediaPage,
    pages: mediaPages,
  } = useAdminMediaStore();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // media picker inline state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState([]); // [{ _id, url }]

  const selectedUrls = useMemo(
    () => selected.map((x) => x.url).filter(Boolean),
    [selected]
  );

  useEffect(() => {
    if (!open) return;
    // preload media once opened
    fetchMedia({ page: 1, limit: 48, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleSelect = (m) => {
    const id = safe(m?._id);
    const url = safe(m?.url || m?.secure_url || m?.src);
    if (!id || !url) return;

    setSelected((prev) => {
      const exists = prev.some((x) => safe(x._id) === id);
      if (exists) return prev.filter((x) => safe(x._id) !== id);
      if (prev.length >= 6) {
        toast.error("Max 6 images allowed");
        return prev;
      }
      return [...prev, { _id: id, url }];
    });
  };

  const removeSelected = (id) => {
    setSelected((prev) => prev.filter((x) => safe(x._id) !== safe(id)));
  };

  const submit = async () => {
    let toastId = null;
    try {
      if (!delivered) throw new Error("You can review after delivery");
      if (disabled) throw new Error("Review is disabled for this item");
      if (!customerId) throw new Error("Login required");
      if (!productId) throw new Error("Product missing");

      setSubmitting(true);
      toastId = toast.loading("Submitting review...");

      // ✅ Send JSON payload (with images URLs)
      // ⚠️ Backend needs to accept req.body.images OR you switch createReview to FormData upload.
      const payload = {
        product: productId,
        productCode: s(productCode),
        customer: customerId,
        rating,
        title: s(title),
        reviewText: s(reviewText),
        verifiedPurchase: !!verifiedPurchase,
        images: selectedUrls,
      };

      const res = await createReview({
        token: null, // pass token if your review endpoint is protected
        payload,
        files: [],
      });

      if (!res) throw new Error("Failed to submit");

      toast.success("✅ Review submitted!", { id: toastId });

      // reset form
      setRating(5);
      setTitle("");
      setReviewText("");
      setSelected([]);
      setPickerOpen(false);

      // collapse after success (nice UX)
      onToggle?.(false);
    } catch (e) {
      toast.error(e?.message || "Submit failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 rounded-3xl border border-gray-200 bg-white overflow-hidden">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => onToggle?.(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition"
      >
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900">Write Review</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {productName} {delivered ? "• Verified purchase" : "• Available after delivery"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Body */}
      {open ? (
        <div className="px-5 pb-5">
          {/* Disabled note */}
          {!delivered ? (
            <div className="mt-2 rounded-2xl bg-yellow-50 text-yellow-800 text-xs font-semibold px-4 py-3">
              You can submit review only after the order is delivered.
            </div>
          ) : null}

          {disabled ? (
            <div className="mt-2 rounded-2xl bg-black/5 text-gray-700 text-xs font-semibold px-4 py-3">
              Review is disabled for this item.
            </div>
          ) : null}

          {/* Rating */}
          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Rating</p>
            <StarPicker
              value={rating}
              onChange={setRating}
              disabled={!delivered || disabled || submitting}
            />
          </div>

          {/* Title */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-900">
              Title <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!delivered || disabled || submitting}
              placeholder="Short headline…"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-black/20 disabled:opacity-60"
            />
          </div>

          {/* Review text */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-900">Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={!delivered || disabled || submitting}
              placeholder="Write your honest review…"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none resize-none focus:bg-white focus:border-black/20 disabled:opacity-60"
            />
          </div>

          {/* Images */}
          <div className="mt-4 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-gray-700" />
                <p className="text-sm font-semibold text-gray-900">Images</p>
                <span className="text-xs text-gray-500">({selected.length}/6)</span>
              </div>

              <button
                type="button"
                disabled={!delivered || disabled || submitting}
                onClick={() => setPickerOpen((v) => !v)}
                className="px-3 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition"
              >
                {pickerOpen ? "Close" : "Choose"}
              </button>
            </div>

            {selected.length > 0 ? (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {selected.map((m) => (
                  <div key={m._id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.url}
                      alt="review"
                      className="h-16 w-full rounded-xl object-cover bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelected(m._id)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition"
                      aria-label="remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                Add photos from your library (optional).
              </p>
            )}

            {/* Picker inline */}
            {pickerOpen ? (
              <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">Media Library</p>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition">
                    <UploadCloud size={16} />
                    {mediaUploading ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        await uploadMedia({ files, folder: "reviews" });
                        await fetchMedia({ page: 1, limit: 48, append: false });
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="mt-4">
                  {mediaLoading ? (
                    <p className="text-sm text-gray-500">Loading media...</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {mediaItems.map((m) => {
                        const id = safe(m?._id);
                        const url = safe(m?.url || m?.secure_url || m?.src);
                        const isPicked = selected.some((x) => safe(x._id) === id);
                        return (
                          <button
                            type="button"
                            key={id || url}
                            onClick={() => toggleSelect(m)}
                            className={`relative rounded-2xl overflow-hidden border transition ${
                              isPicked
                                ? "border-black"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="media"
                              className="h-24 w-full object-cover bg-gray-100"
                            />
                            {isPicked ? (
                              <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-black text-white font-semibold">
                                Selected
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {mediaPages > 1 ? (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="px-4 py-2 rounded-xl bg-black/5 text-sm font-semibold hover:bg-black/10 disabled:opacity-40"
                      disabled={mediaPage <= 1 || mediaLoading}
                      onClick={() =>
                        fetchMedia({
                          page: Math.max(1, mediaPage - 1),
                          limit: 48,
                          append: false,
                        })
                      }
                    >
                      Prev
                    </button>

                    <p className="text-xs text-gray-500">
                      Page {mediaPage} / {mediaPages}
                    </p>

                    <button
                      className="px-4 py-2 rounded-xl bg-black/5 text-sm font-semibold hover:bg-black/10 disabled:opacity-40"
                      disabled={mediaPage >= mediaPages || mediaLoading}
                      onClick={() =>
                        fetchMedia({
                          page: Math.min(mediaPages, mediaPage + 1),
                          limit: 48,
                          append: false,
                        })
                      }
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={!delivered || disabled || submitting}
            onClick={submit}
            className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-40 transition"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
