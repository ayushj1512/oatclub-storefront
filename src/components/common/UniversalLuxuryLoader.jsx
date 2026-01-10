"use client";

import { useEffect, useState } from "react";

const TEXTS = [
  "Preparing Your Edit",
  "Curating Elegance",
  "Styling the Details",
  "Almost There",
  "Loading the Look",
  "Crafting Perfection",
  "Refining the Frame",
  "Polishing the Finish",
  "Shaping the Aesthetic",
  "Final Touches",
  "Perfecting the Mood",
  "Designing the Moment",
  "Building the Atmosphere",
  "Elevating the Look",
  "Tailoring the Experience",
];

export default function UniversalLuxuryLoader({ interval = 2400 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % TEXTS.length);
    }, interval);

    return () => clearInterval(t);
  }, [interval]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
      {/* Minimal Dots */}
      <div className="flex items-center gap-3">
        <span className="lux-dot lux-dot-1" />
        <span className="lux-dot lux-dot-2" />
        <span className="lux-dot lux-dot-3" />
      </div>

      {/* Premium Text */}
      <p
        key={index}
        className="lux-text text-black/80 transition-opacity duration-500"
      >
        {TEXTS[index]}
      </p>

      <style>{`
        .lux-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #000;
          opacity: 0.25;
          animation: lux-pulse 1.4s ease-in-out infinite;
        }

        .lux-dot-2 { animation-delay: 0.18s; }
        .lux-dot-3 { animation-delay: 0.36s; }

        .lux-text {
          font-size: 12px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          font-weight: 500;
          line-height: 1.3;
        }

        @keyframes lux-pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.25; }
          50% { transform: scale(1.2); opacity: 0.95; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lux-dot { animation: none; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
