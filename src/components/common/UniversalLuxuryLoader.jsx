"use client";

import { useEffect, useState } from "react";

const TEXTS = [
  "Preparing Your Edit",
  "Curating Elegance",
  "Styling the Details",
  "Almost There",
  "Loading the Look",
];

export default function UniversalLuxuryLoader({
  interval = 2200,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % TEXTS.length);
    }, interval);
    return () => clearInterval(t);
  }, [interval]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 px-3 text-center">
      {/* Dots */}
      <div className="flex items-center gap-[clamp(8px,2.5vw,14px)]">
        <span className="lux-dot lux-dot-1" />
        <span className="lux-dot lux-dot-2" />
        <span className="lux-dot lux-dot-3" />
      </div>

      {/* Text */}
      <p
        key={index}
        className="lux-text font-semibold uppercase text-black/70 transition-opacity duration-500"
      >
        {TEXTS[index]}
      </p>

      {/* Styles */}
      <style>{`
        .lux-dot {
          width: clamp(8px, 3vw, 12px);
          height: clamp(8px, 3vw, 12px);
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, #ffffff, #111111);
          animation: lux-breathe 2.2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
        }

        .lux-dot-2 {
          animation-delay: 0.3s;
          opacity: 0.85;
        }

        .lux-dot-3 {
          animation-delay: 0.6s;
          opacity: 0.65;
        }

        .lux-text {
          font-size: clamp(10px, 3.2vw, 12px);
          letter-spacing: clamp(0.22em, 1vw, 0.34em);
          line-height: 1.3;
        }

        @keyframes lux-breathe {
          0% {
            transform: scale(0.9);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lux-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
