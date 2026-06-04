"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "GOOD STYLE DOES NOT SHOUT. IT STAYS.",
  "YOUR NEXT FIT IS BEING PRESSED AND PLACED.",
  "THE BEST PIECES FEEL EASY FIRST.",
  "A CLEAN EDIT IS ALWAYS WORTH THE WAIT.",
];

export default function UniversalLuxuryLoader({ interval = 1800 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % QUOTES.length),
      interval
    );
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center text-black">
      <div className="relative h-20 w-44 overflow-hidden border-y border-black/10">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/15" />
        <div className="loader-runner absolute left-0 top-1/2 h-8 w-8 -translate-y-1/2 border border-black bg-white">
          <span className="absolute inset-1 border border-black/20" />
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`h-1.5 w-1.5 ${dot === index ? "bg-black" : "bg-black/20"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 max-w-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/45">
          OATCLUB IS LOADING
        </p>
        <p className="mt-3 min-h-10 text-xs font-black uppercase leading-5 tracking-[0.14em] text-black md:text-sm">
          {QUOTES[index]}
        </p>
      </div>

      <div className="mt-5 h-px w-40 overflow-hidden bg-black/10">
        <span className="loader-progress block h-full w-1/2 bg-black" />
      </div>

      <style jsx>{`
        .loader-runner {
          animation: oat-runner 1.4s ease-in-out infinite;
        }

        .loader-progress {
          animation: oat-progress 1.4s ease-in-out infinite;
        }

        @keyframes oat-runner {
          0% {
            transform: translate(-36px, -50%) rotate(0deg);
          }
          50% {
            transform: translate(156px, -50%) rotate(180deg);
          }
          100% {
            transform: translate(-36px, -50%) rotate(360deg);
          }
        }

        @keyframes oat-progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
