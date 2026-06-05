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
    <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center text-black">
      <div className="flex w-full items-center justify-center gap-x-2">
        <span className="h-4 w-4 animate-bounce rounded-full bg-black [animation-delay:-0.24s]" />
        <span className="h-4 w-4 animate-bounce rounded-full bg-black/55 [animation-delay:-0.12s]" />
        <span className="h-4 w-4 animate-bounce rounded-full bg-black/25" />
      </div>

      <div className="mt-5 max-w-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
          LOADING
        </p>
        <p className="mt-3 min-h-10 text-xs font-black uppercase leading-5 tracking-[0.12em] text-black/70 md:text-sm">
          {QUOTES[index]}
        </p>
      </div>
    </div>
  );
}
