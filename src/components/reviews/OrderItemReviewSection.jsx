"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Image as ImageIcon,
  PartyPopper,
  Trash2,
  Video as VideoIcon,
} from "lucide-react";

import { useMediaStore } from "@/store/useMediaStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useAuthStore } from "@/store/authStore";
import { useCouponStore } from "@/store/couponStore";

const safe = (v) => (v == null ? "" : String(v));
const s = (v) => safe(v).trim();

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = Number(value) >= i + 1;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onChange(i + 1)}
            className="p-1 -m-1 rounded-lg disabled:opacity-50 active:scale-[0.98] transition"
            aria-label={`${i + 1} star`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-7 w-7 sm:h-6 sm:w-6 ${
                active ? "text-yellow-400" : "text-gray-300"
              }`}
              fill={active ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 17.3l-6.18 3.64 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.67 1.64 7.03z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/**
 * ✅ Fixes:
 * - "already reviewed" true hote hi section auto-close ho jayega
 * - header toggle (expand) disable ho jayega
 * - parent ko callback: onReviewed(productId) so parent button disable instantly
 * - server/store check + session marker fallback
 *
 * Limits:
 * - Max 4 images + 1 video
 * - object-contain previews
 * - upload on submit only
 */
export default function OrderItemReviewSection({
  open,
  onToggle,
  delivered = false,

  productId,
  productCode = "",
  productName = "Product",

  verifiedPurchase = true,
  disabled = false,

  customerId: customerIdProp,
  token: tokenProp,
  isAuthenticated: isAuthenticatedProp,

  // ✅ NEW: parent hook
  onReviewed,
  onSubmitted,
}) {
  const auth = useAuthStore();
  const addEarnedCoupon = useCouponStore((state) => state.addEarnedCoupon);
  const customerId = s(customerIdProp) || s(auth?.customer?._id);
  const token = tokenProp ?? auth?.token;
  const isAuthenticated =
    typeof isAuthenticatedProp === "boolean"
      ? isAuthenticatedProp
      : !!auth?.isAuthenticated;

  const reviewStore = useReviewStore();
  const { createReview } = reviewStore;

  // best-effort checker (if store has it)
  const reviewCheckFn =
    reviewStore?.checkReviewed ||
    reviewStore?.hasReviewed ||
    reviewStore?.isReviewed ||
    reviewStore?.getMyReviewByProduct ||
    reviewStore?.fetchMyReviewByProduct ||
    null;

  const { uploadMedia, uploading: mediaUploading, setFolder } = useMediaStore();

  const fileRef = useRef(null);
  const [fileKey, setFileKey] = useState(0);

  const [rating, setRating] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rewardVisible, setRewardVisible] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // local media: { id, file, preview, kind: "image"|"video" }
  const [localMedia, setLocalMedia] = useState([]);

  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [checkingReviewed, setCheckingReviewed] = useState(false);

  const storageReviewedKey = useMemo(() => {
    const cid = s(customerId);
    const pid = s(productId);
    return cid && pid ? `review_submitted:${cid}:${pid}` : "";
  }, [customerId, productId]);

  const draftKey = useMemo(() => {
    const pid = s(productId);
    const cid = s(customerId);
    return pid && cid ? `review_draft:${cid}:${pid}` : "";
  }, [productId, customerId]);

  const clearDraft = () => {
    if (!draftKey) return;
    try {
      sessionStorage.removeItem(draftKey);
    } catch {}
  };

  const loadDraft = () => {
    if (!draftKey) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw || "{}");
      setRating(d?.rating == null ? null : Number(d.rating) || null);
      if (typeof d?.reviewText === "string") setReviewText(d.reviewText);
    } catch {}
  };

  const saveDraft = (next = {}) => {
    if (!draftKey) return;
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          rating: next.rating ?? rating,
          reviewText: next.reviewText ?? reviewText,
          at: Date.now(),
        })
      );
    } catch {}
  };

  const cleanupURL = (url) => {
    try {
      if (url?.startsWith?.("blob:")) URL.revokeObjectURL(url);
    } catch {}
  };

  const imageCount = useMemo(
    () => localMedia.filter((m) => m.kind === "image").length,
    [localMedia]
  );
  const videoCount = useMemo(
    () => localMedia.filter((m) => m.kind === "video").length,
    [localMedia]
  );

  const removeLocal = (id) => {
    setLocalMedia((prev) => {
      const hit = prev.find((x) => x.id === id);
      if (hit?.preview) cleanupURL(hit.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const resetLocal = () => {
    setLocalMedia((prev) => {
      prev.forEach((x) => cleanupURL(x.preview));
      return [];
    });
    setFileKey((k) => k + 1);
  };

  const addLocalFiles = (filesLike) => {
    const files = Array.from(filesLike || []);
    if (!files.length) return;

    const MAX_IMAGES = 4;
    const MAX_VIDEOS = 1;

    const next = [];
    let nextImages = 0;
    let nextVideos = 0;

    for (const file of files) {
      const type = String(file?.type || "");
      const isImg = type.startsWith("image/");
      const isVid = type.startsWith("video/");

      if (!isImg && !isVid) {
        toast.error("Only image/video files allowed");
        continue;
      }

      const canAddImg = isImg && imageCount + nextImages < MAX_IMAGES;
      const canAddVid = isVid && videoCount + nextVideos < MAX_VIDEOS;

      if (!canAddImg && !canAddVid) {
        toast.error(isVid ? `Only ${MAX_VIDEOS} video allowed` : `Max ${MAX_IMAGES} images allowed`);
        continue;
      }

      const id =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      next.push({
        id,
        file,
        kind: isVid ? "video" : "image",
        preview: URL.createObjectURL(file),
      });

      if (isVid) nextVideos += 1;
      else nextImages += 1;

      if (imageCount + nextImages >= MAX_IMAGES && videoCount + nextVideos >= MAX_VIDEOS) break;
    }

    if (!next.length) return;
    setLocalMedia((p) => [...p, ...next]);
    setFileKey((k) => k + 1);
  };

  const uploadSelectedMedia = async () => {
    const files = localMedia.map((x) => x.file).filter(Boolean);
    if (!files.length) return { images: [], videos: [] };

    const resp = await uploadMedia({ files, folder: "reviews" });
    const uploaded = Array.isArray(resp?.media) ? resp.media : [];

    const images = [];
    const videos = [];

    for (const m of uploaded) {
      const url = s(m?.url);
      if (!url) continue;
      const mt = String(m?.mimeType || "").toLowerCase();
      const isVideo = mt.startsWith("video/") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
      if (isVideo) videos.push(url);
      else images.push(url);
    }

    if (uploaded.length !== files.length) toast.error("Some media failed to upload");

    return { images: images.slice(0, 4), videos: videos.slice(0, 1) };
  };

  // ✅ check reviewed (session marker + store check)
  const checkReviewed = async () => {
    const cid = s(customerId);
    const pid = s(productId);
    if (!cid || !pid || !isAuthenticated) return false;

    // session marker fast-path
    if (storageReviewedKey) {
      try {
        if (sessionStorage.getItem(storageReviewedKey) === "1") return true;
      } catch {}
    }

    if (typeof reviewCheckFn !== "function") return false;

    try {
      setCheckingReviewed(true);

      const out =
        reviewCheckFn.length >= 1
          ? await reviewCheckFn({ token, productId: pid, customerId: cid })
          : await reviewCheckFn(pid);

      const reviewed =
        out === true ||
        (!!out && typeof out === "object" && (out._id || out.review || out.data));

      if (reviewed && storageReviewedKey) {
        try {
          sessionStorage.setItem(storageReviewedKey, "1");
        } catch {}
      }

      return !!reviewed;
    } catch {
      return false;
    } finally {
      setCheckingReviewed(false);
    }
  };

  // ✅ on open -> setup + check reviewed + draft
  useEffect(() => {
    if (!open) return;

    setFolder("reviews");
    loadDraft();

    (async () => {
      const reviewed = await checkReviewed();
      if (reviewed) {
        setAlreadyReviewed(true);

        // ✅ auto close immediately
        try {
          onToggle?.(false);
        } catch {}
      } else {
        setAlreadyReviewed(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // autosave
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => saveDraft(), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rating, reviewText]);

  // cleanup previews
  useEffect(() => {
    return () => localMedia.forEach((x) => cleanupURL(x.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSelectMore = imageCount < 4 || videoCount < 1;

  const disabledUI =
    !delivered ||
    disabled ||
    submitting ||
    mediaUploading ||
    checkingReviewed ||
    alreadyReviewed;

  const headerDisabled = alreadyReviewed || checkingReviewed;

  const submit = async () => {
    let toastId = null;
    try {
      const pid = s(productId);
      const cid = s(customerId);

      if (!delivered) throw new Error("You can review after delivery");
      if (disabled) throw new Error("Review disabled");
      if (!isAuthenticated || !cid) throw new Error("Login required");
      if (!pid) throw new Error("Product missing");

      // ✅ final guard (in case review got created elsewhere)
      const reviewedNow = await checkReviewed();
      if (reviewedNow) {
        setAlreadyReviewed(true);
        toast.error("You’ve already reviewed this item.");
        try {
          onToggle?.(false);
        } catch {}
        return;
      }

      if (!rating) throw new Error("Please select rating");

      setSubmitting(true);
      toastId = toast.loading(localMedia.length ? "Uploading & submitting..." : "Submitting...");

      const { images, videos } = localMedia.length
        ? await uploadSelectedMedia()
        : { images: [], videos: [] };

      const payload = {
        product: pid,
        ...(s(productCode) ? { productCode: s(productCode) } : {}),
        customer: cid,
        rating: Number(rating),
        reviewText: s(reviewText),
        verifiedPurchase: !!verifiedPurchase,
        images,
        videos,
      };

      const res = await createReview({ token, payload });
      if (!res) throw new Error("Failed to submit");

      toast.success("Review submitted!", { id: toastId });

      setAlreadyReviewed(true);
      if (storageReviewedKey) {
        try {
          sessionStorage.setItem(storageReviewedKey, "1");
        } catch {}
      }

      setRewardVisible(true);
      addEarnedCoupon?.({
        code: "THANKU10",
        title: "Review reward",
        description: "10% off unlocked for submitting your review.",
        discountType: "percent",
        discountValue: 10,
        source: "review",
        visibility: "private",
      });
      setRating(null);
      setReviewText("");
      resetLocal();
      clearDraft();

      // Keep the coupon visible in this panel. Parent review state can sync on next fetch/session check.
    } catch (e) {
      toast.error(e?.message || "Submit failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText("THANKU10");
      setCopiedCoupon(true);
      toast.success("THANKU10 copied");
      window.setTimeout(() => setCopiedCoupon(false), 1200);
    } catch {
      toast.success("Use code THANKU10");
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <button
        type="button"
        disabled={headerDisabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (headerDisabled) return;
          onToggle?.(!open);
        }}
        className={`w-full px-4 py-3 flex items-center justify-between gap-3 transition ${
          headerDisabled ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50"
        }`}
      >
        <div className="text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {alreadyReviewed ? "Already Reviewed" : "Write Review"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {productName}{" "}
            {alreadyReviewed
              ? "• Thanks for your feedback"
              : delivered
              ? "• Verified purchase"
              : "• After delivery"}
          </p>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open ? (
        <div className="px-4 pb-4">
          {rewardVisible ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-black bg-black text-white">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black">
                    <PartyPopper size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                      Review received
                    </p>
                    <h3 className="mt-1 text-lg font-black uppercase leading-tight">
                      Thank you for helping OATCLUB girls choose better.
                    </h3>
                    <p className="mt-2 text-xs font-bold uppercase leading-5 tracking-[0.08em] text-white/60">
                      Use this on your next order for 10% off.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyCoupon}
                  className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left text-black"
                >
                  <span>
                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
                      Coupon code
                    </span>
                    <span className="block text-2xl font-black uppercase tracking-[0.12em]">
                      THANKU10
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
                    {copiedCoupon ? "Copied" : "Copy"}
                    <Copy size={16} />
                  </span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Rating */}
          <div className={`mt-3 rounded-2xl bg-gray-50 p-3 ${rewardVisible ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Rating</p>
              {rating ? (
                <button
                  type="button"
                  disabled={disabledUI}
                  onClick={() => setRating(null)}
                  className="text-xs font-semibold text-gray-600 px-2 py-1 -mr-2 rounded-lg hover:bg-black/5"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="mt-2">
              <StarPicker value={rating} onChange={setRating} disabled={disabledUI} />
            </div>

            {!rating ? (
              <p className="mt-2 text-[11px] text-gray-500">Tap a star to select rating</p>
            ) : null}
          </div>

          {/* Review */}
          <div className="mt-3">
            <label className="text-sm font-semibold text-gray-900">Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={disabledUI}
              placeholder="Write your honest review…"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none resize-none focus:bg-white focus:border-black/20 disabled:opacity-60"
            />
          </div>

          {/* Media */}
          <div className="mt-3 rounded-2xl border border-gray-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="shrink-0" />
                  <p className="text-sm font-semibold text-gray-900 truncate">Media</p>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                  Images {imageCount}/4 • Video {videoCount}/1
                </p>
              </div>

              <button
                type="button"
                disabled={disabledUI || !canSelectMore}
                onClick={() => fileRef.current?.click()}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-black text-white disabled:opacity-40"
              >
                Select
              </button>

              <input
                key={fileKey}
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*"
                hidden
                onChange={(e) => addLocalFiles(e.target.files)}
              />
            </div>

            {localMedia.length ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {localMedia.map((m) => (
                  <div key={m.id} className="relative rounded-xl overflow-hidden bg-gray-100">
                    {m.kind === "video" ? (
                      <div className="relative h-24 w-full">
                        <video
                          src={m.preview}
                          className="h-full w-full object-contain bg-black/5"
                          controls
                          playsInline
                        />
                        <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5">
                          <VideoIcon size={12} />
                          VIDEO
                        </span>
                      </div>
                    ) : (
                      <div className="relative h-24 w-full">
                        <Image
                          src={m.preview}
                          alt="review"
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 33vw, 20vw"
                          className="object-contain"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeLocal(m.id)}
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-black text-white"
                      aria-label="remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                Optional. Uploads on submit only. Max 4 images + 1 video.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={disabledUI || !isAuthenticated}
            onClick={submit}
            className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold bg-black text-white disabled:opacity-40 active:scale-[0.99] transition"
          >
            {alreadyReviewed ? "Already Reviewed" : submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
