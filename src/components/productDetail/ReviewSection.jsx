"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

const N = 100;

const NAMES = ["Aarushi","Saanvi","Rhea","Krisha","Nisha","Divya","Radhika","Ananya","Ishita","Meera","Pooja","Tanvi","Palak","Simran","Kavya","Neha","Aditi","Priya","Bhavna","Surbhi","Ira","Mahi","Shruti","Jhanvi","Khushi","Sakshi","Vaishnavi","Muskan","Ritu","Tanya"];
const SURNAMES = ["Mehta","Patel","Kapoor","Shah","Verma","Sharma","Joshi","Bansal","Malhotra","Chopra","Singh","Gupta","Jain","Agarwal","Nair","Reddy","Iyer","Khan","Das","Saxena"];
const COMMENTS = [
  "Fabric feels premium and super comfortable.",
  "Loved the fit — looks even better in real.",
  "Stitching and finishing is really neat.",
  "Worth the price, totally recommended!",
  "Color and quality both are amazing.",
  "Perfect for parties, got many compliments.",
  "Soft material and great fall on the body.",
  "Delivery was quick and packaging was nice.",
  "Slightly loose on me but overall good.",
  "Looks classy and elegant, happy with it.",
  "Exactly as shown, very satisfied.",
  "Good value for money, would buy again.",
  "Comfortable for long wear, breathable.",
  "Nice design, premium look and feel.",
  "Size matched perfectly, no alterations needed.",
];

const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pickRating = () => (Math.random() < 0.62 ? 5 : Math.random() < 0.92 ? 4 : 3);
const randomDate = () => {
  const start = new Date("2024-10-01T00:00:00.000Z");
  const end = new Date("2025-10-01T00:00:00.000Z");
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t).toISOString().slice(0, 10);
};

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);   // ✅ generated after mount
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const arr = Array.from({ length: N }, (_, i) => ({
      id: i + 1,
      name: `${NAMES[ri(0, NAMES.length - 1)]} ${SURNAMES[ri(0, SURNAMES.length - 1)]}`,
      rating: pickRating(),
      comment: COMMENTS[ri(0, COMMENTS.length - 1)],
      date: randomDate(),
    }));

    // ✅ ensure avg >= 3.9
    let avg = arr.reduce((s, x) => s + x.rating, 0) / arr.length;
    if (avg < 3.9) {
      for (let i = 0; i < arr.length && avg < 3.9; i++) {
        if (arr[i].rating === 4) arr[i].rating = 5;
        avg = arr.reduce((s, x) => s + x.rating, 0) / arr.length;
      }
    }

    setReviews(shuffle(arr));
  }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const distribution = useMemo(() => {
    const c = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => (c[r.rating] += 1));
    return c;
  }, [reviews]);

  if (!reviews.length) return null; // ✅ avoids hydration issues

  return (
    <div className="mt-10 border-t border-gray-400 pt-6">
      <h2 className="text-lg md:text-xl font-semibold text-black mb-4">Customer Reviews</h2>

      {/* SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-bold text-black">{averageRating}</h3>
          <div className="flex justify-center md:justify-start mt-1 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(+averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-1">{reviews.length} Reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star];
            const percent = (count / reviews.length) * 100 || 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-6 text-xs font-medium text-black">{star}★</span>
                <div className="flex-1 h-2 bg-gray-300 rounded-full">
                  <div className="h-full bg-black rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-[11px] text-gray-700 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-6 space-y-5">
        {reviews.slice(0, visibleCount).map((r) => (
          <div key={r.id} className="border-b border-gray-300 pb-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-black">{r.name}</h4>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`} />
                ))}
              </div>
            </div>
            <p className="text-[12px] text-gray-700 mt-0.5">{r.date}</p>
            <p className="text-gray-800 text-sm mt-2 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>

      {visibleCount < reviews.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setVisibleCount((p) => p + 3)}
            className="px-4 py-2 text-sm border border-gray-600 rounded-md text-black hover:bg-gray-200 transition"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
