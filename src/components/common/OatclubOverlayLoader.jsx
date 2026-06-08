"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BRAND_IMAGE =
  "https://res.cloudinary.com/dpsvrt4sd/image/upload/v1780338447/qavpt44lsxsy3wrvuwi8.png";

export default function OatclubOverlayLoader({
  show = false,
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!show) return undefined;
    const timer = window.setTimeout(() => setActive(true), 20);
    return () => window.clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    if (!show) setActive(false);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] grid place-items-center overflow-hidden bg-white/96 px-4 text-black backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-label="Loading OATCLUB"
    >
      <div
        className={`grid place-items-center transition duration-500 ${
          active ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="relative h-[112px] w-[112px] animate-[oatclub-flash_1.05s_ease-in-out_infinite] sm:h-[132px] sm:w-[132px]">
          <Image
            src={BRAND_IMAGE}
            alt="OATCLUB"
            fill
            priority
            sizes="104px"
            className="object-contain"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes oatclub-flash {
          0% {
            opacity: 0.28;
            filter: contrast(1) brightness(1);
            transform: scale(0.98);
          }
          18% {
            opacity: 1;
            filter: contrast(1.08) brightness(1.04);
            transform: scale(1.02);
          }
          34% {
            opacity: 0.48;
            transform: scale(1);
          }
          52% {
            opacity: 1;
            transform: scale(1.015);
          }
          100% {
            opacity: 0.34;
            filter: contrast(1) brightness(1);
            transform: scale(0.99);
          }
        }
      `}</style>
    </div>
  );
}
