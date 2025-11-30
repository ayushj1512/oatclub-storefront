"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

const mockReviews = [
  {
    id: 1,
    name: "Aarushi Mehta",
    rating: 5,
    comment: "Loved the fabric and the fit! Looks exactly like the pictures.",
    date: "2024-10-02",
    images: ["/reviews/rev1.jpg", "/reviews/rev2.jpg"],
  },
  {
    id: 2,
    name: "Saanvi Patel",
    rating: 4,
    comment: "Quality is great but shipping took a bit longer.",
    date: "2024-09-18",
    images: ["/reviews/rev3.jpg"],
  },
  {
    id: 3,
    name: "Rhea Kapoor",
    rating: 5,
    comment: "Perfect fitting & super comfortable. Definitely worth it!",
    date: "2024-08-21",
    images: [],
  },
  {
    id: 4,
    name: "Krisha Shah",
    rating: 3,
    comment: "Good product but color was slightly different.",
    date: "2024-07-11",
    images: [],
  },
  {
    id: 5,
    name: "Nisha Verma",
    rating: 4,
    comment: "Fits perfectly. Fabric feels premium.",
    date: "2024-06-02",
    images: ["/reviews/rev4.jpg"],
  },
  {
    id: 6,
    name: "Divya Sharma",
    rating: 5,
    comment: "Absolutely in love! Will buy again.",
    date: "2024-05-28",
    images: [],
  },
  {
    id: 7,
    name: "Radhika Joshi",
    rating: 4,
    comment: "Comfortable and stylish! Recommended.",
    date: "2024-05-10",
    images: [],
  },
];

export default function ReviewSection() {
  const [visibleCount, setVisibleCount] = useState(3);

  const loadMore = () => setVisibleCount((prev) => prev + 3);

  // ⭐ Average Rating
  const averageRating = useMemo(() => {
    if (!mockReviews.length) return 0;
    const total = mockReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / mockReviews.length).toFixed(1);
  }, []);

  // ⭐ Distribution
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    mockReviews.forEach((r) => (counts[r.rating] += 1));
    return counts;
  }, []);

  return (
    <div className="mt-10 border-t border-gray-400 pt-6">
      <h2 className="text-lg md:text-xl font-semibold text-black mb-4">
        Customer Reviews
      </h2>

      {/* SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* LEFT: AVERAGE */}
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-bold text-black">{averageRating}</h3>

          <div className="flex justify-center md:justify-start mt-1 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-700 mt-1">
            {mockReviews.length} Reviews
          </p>
        </div>

        {/* RIGHT: DISTRIBUTION */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star];
            const percent = (count / mockReviews.length) * 100 || 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-6 text-xs font-medium text-black">{star}★</span>

                <div className="flex-1 h-2 bg-gray-300 rounded-full">
                  <div
                    className="h-full bg-black rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="text-[11px] text-gray-700 w-6 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-6 space-y-5">
        {mockReviews.slice(0, visibleCount).map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-300 pb-4"
          >
            {/* NAME + RATING */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-black">{review.name}</h4>

              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-[12px] text-gray-700 mt-0.5">{review.date}</p>

            {/* COMMENT */}
            <p className="text-gray-800 text-sm mt-2 leading-relaxed">
              {review.comment}
            </p>

            {/* IMAGES */}
            {review.images.length > 0 && (
              <div className="flex gap-3 mt-2 overflow-x-auto no-scrollbar">
                {review.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-md overflow-hidden"
                  >
                    <Image
                      src={img}
                      alt="review image"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* LOAD MORE */}
      {visibleCount < mockReviews.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 text-sm border border-gray-600 rounded-md text-black hover:bg-gray-200 transition"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
