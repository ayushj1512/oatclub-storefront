"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Star, X, ZoomIn } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const initials = (value = "") =>
  String(value || "OC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const dateText = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

function Stars({ value = 0, size = "h-3.5 w-3.5" }) {
  const rating = Math.round(Number(value || 0));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${size} ${index < rating ? "fill-black text-black" : "text-black/18"}`}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}

function PhotoLightbox({ photos, active, setActive, onClose }) {
  const current = photos[active] || photos[0];

  if (!current) return null;

  const move = (direction) => {
    const next =
      direction === "next"
        ? (active + 1) % photos.length
        : (active - 1 + photos.length) % photos.length;
    setActive(next);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-white text-black" role="dialog" aria-modal="true">
      <div className="absolute left-4 top-4 z-20 text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
        {String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white"
        aria-label="Close review photo"
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => move("prev")}
            className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white"
            aria-label="Previous review photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => move("next")}
            className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center border border-black bg-white text-black transition hover:bg-black hover:text-white"
            aria-label="Next review photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="flex h-full w-full items-center justify-center px-4 py-20 md:px-20">
        <div className="h-full w-full overflow-auto">
          <img
            src={current}
            alt="Review photo"
            className="mx-auto h-auto max-h-none min-h-full w-auto max-w-none object-contain md:max-h-full md:min-h-0 md:max-w-full"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-14 w-11 shrink-0 overflow-hidden border ${
                index === active ? "border-black" : "border-black/10"
              }`}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewSection({ productCode = "" }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(4);
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    const code = String(productCode || "").trim();
    if (!code || !API_BASE) return;

    let alive = true;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const [reviewRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/api/reviews/product-code/${encodeURIComponent(code)}?page=1&limit=24&sort=latest`, {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/api/reviews/product-code/${encodeURIComponent(code)}/summary`, {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        const reviewData = await safeJson(reviewRes);
        const summaryData = await safeJson(summaryRes);

        if (!alive) return;
        setReviews(reviewRes.ok && Array.isArray(reviewData?.items) ? reviewData.items : []);
        setSummary(summaryRes.ok ? summaryData : null);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setReviews([]);
          setSummary(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [productCode]);

  const photos = useMemo(
    () =>
      reviews
        .flatMap((review) => (Array.isArray(review?.images) ? review.images : []))
        .filter(Boolean)
        .slice(0, 24),
    [reviews]
  );

  const distribution = summary?.distribution || {};
  const totalReviews = Number(summary?.totalReviews || reviews.length || 0);
  const averageRating = Number(summary?.averageRating || 0);

  if (!loading && !reviews.length && !totalReviews) return null;

  return (
    <section className="bg-white px-0 py-8 text-black md:py-10">
      <div className="border-t border-black/10 pt-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/40">
              Customer reviews
            </p>
            <h2 className="mt-1 text-xl font-black uppercase leading-tight md:text-2xl">
              Rated by OATCLUB girls
            </h2>
          </div>
          {totalReviews > 0 ? (
            <span className="border border-black/10 bg-neutral-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/50">
              {totalReviews} reviews
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="bg-neutral-50 p-4">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black leading-none">{averageRating.toFixed(1)}</span>
              <div className="pb-1">
                <Stars value={averageRating} size="h-4 w-4" />
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">
                  Average rating
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = Number(distribution?.[star] || distribution?.[String(star)] || 0);
                const percent = totalReviews ? Math.min(100, (count / totalReviews) * 100) : 0;
                return (
                  <div key={star} className="grid grid-cols-[32px_1fr_28px] items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-black/55">{star} ST</span>
                    <div className="h-1.5 bg-white">
                      <div className="h-full bg-black" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-right text-[10px] font-black text-black/45">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            {photos.length ? (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-black/45">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Customer photos
                </div>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() => setActivePhoto(index)}
                      className="group relative aspect-[4/5] w-[82px] shrink-0 overflow-hidden bg-neutral-100 md:w-[112px]"
                    >
                      <img src={photo} alt="Customer review" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                      <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                        <ZoomIn className="h-4 w-4" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-24 animate-pulse bg-neutral-100" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {reviews.slice(0, visible).map((review) => (
                  <article key={review._id} className="border border-black/10 bg-white p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center bg-black text-[11px] font-black uppercase text-white">
                          {initials(review.customerName || review.customer?.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black uppercase tracking-[0.1em] text-black">
                            {review.customerName || review.customer?.name || "OATCLUB CUSTOMER"}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black/38">
                            {review.verifiedPurchase ? "Verified purchase" : "Customer review"} / {dateText(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Stars value={review.rating} />
                    </div>

                    {review.reviewText ? (
                      <p className="mt-3 text-[12px] font-semibold uppercase leading-5 tracking-[0.05em] text-black/58">
                        {review.reviewText}
                      </p>
                    ) : null}

                    {Array.isArray(review.images) && review.images.length ? (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {review.images.slice(0, 4).map((image, index) => (
                          <button
                            key={`${review._id}-${index}`}
                            type="button"
                            onClick={() => setActivePhoto(photos.indexOf(image))}
                            className="relative h-16 w-12 shrink-0 overflow-hidden bg-neutral-100"
                          >
                            <img src={image} alt="Customer review" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}

            {visible < reviews.length ? (
              <button
                type="button"
                onClick={() => setVisible((count) => count + 4)}
                className="mt-4 h-11 w-full border border-black bg-white text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-white"
              >
                Load more reviews
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {activePhoto != null ? (
        <PhotoLightbox photos={photos} active={Math.max(0, activePhoto)} setActive={setActivePhoto} onClose={() => setActivePhoto(null)} />
      ) : null}
    </section>
  );
}
