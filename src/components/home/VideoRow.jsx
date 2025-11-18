"use client";
import { useEffect, useRef } from "react";

const videoUrls = [
  "https://mirayfashions.com/wp-content/uploads/2025/10/137cf091405223837c47fd9297cd5504.mp4",
  "https://mirayfashions.com/wp-content/uploads/2025/10/60c4f113d46da5d704fb36d7212ce5a3.mp4",
  "https://mirayfashions.com/wp-content/uploads/2025/10/4165e18da252f877d3fc38542ef8734d.mp4",
  "https://mirayfashions.com/wp-content/uploads/2025/10/103d7a1184e604c1f2173abaadd7e2f4.mp4",
  "https://mirayfashions.com/wp-content/uploads/2025/10/88ea3bd7609ac14b35c0dd9d89a586a1.mp4",
  "https://mirayfashions.com/wp-content/uploads/2025/10/ebbdaaa759e439cca326d4096286575b.mp4",
  "https://mirayfashions.com/wp-content/uploads/2025/10/b354e2323463863d462b14f1f8d71bdc_t4.mp4",
];

export default function VideoRow() {
  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) v.play().catch(() => {});
    });
  }, []);

  return (
    <section className="w-full flex flex-col bg-white py-8 md:py-12 overflow-hidden">
      <h2 className="text-xl md:text-3xl font-semibold text-gray-900 px-6 md:px-10 mb-6 md:mb-8">
        Fashion in Motion
      </h2>

      {/* Mobile scroll */}
      <div className="flex md:hidden gap-4 px-6 overflow-x-auto scrollbar-none snap-x snap-mandatory">
        {videoUrls.map((src, index) => (
          <div
            key={index}
            className="min-w-[160px] max-w-[180px] snap-start aspect-[9/16] rounded-2xl overflow-hidden bg-gray-200 relative"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={src}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6 px-6 md:px-10">
        {videoUrls.map((src, index) => (
          <div
            key={index}
            className="w-full aspect-[9/16] rounded-3xl overflow-hidden bg-gray-200 relative group cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={src}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-white/20 shadow-inner" />
          </div>
        ))}
      </div>
    </section>
  );
}
