"use client";

import Link from "next/link";

const options = [
  { id: 1, className: "hot-1", name: "Moving Fire Gradient" },
  { id: 2, className: "hot-2", name: "Luxury Ember Glow" },
  { id: 3, className: "hot-3", name: "Flame Wave" },
  { id: 4, className: "hot-4", name: "Burning Border" },
  { id: 5, className: "hot-5", name: "Minimal Fire Pulse" },
];

export default function TestPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] px-5 py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-[10px] font-semibold tracking-[3px] text-gray-400">
            OATCLUB NAVIGATION TEST
          </p>

          <h1 className="text-2xl font-semibold text-black">
            Choose HOTSELLER Style
          </h1>
        </div>

        <div className="space-y-5">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5"
            >
              <div>
                <p className="text-[10px] font-bold tracking-[1.5px] text-gray-400">
                  OPTION {option.id}
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {option.name}
                </p>
              </div>

              <Link
                href="/hotseller"
                className={`hot-button ${option.className}`}
              >
                <span className="flames" />

                <span className="hot-text">HOTSELLER</span>

                <span className="fire-icon">🔥</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .hot-button {
          position: relative;
          isolation: isolate;
          display: flex;
          height: 34px;
          min-width: 132px;
          align-items: center;
          justify-content: center;
          gap: 6px;
          overflow: hidden;
          padding: 0 16px;
          border-radius: 3px;
          text-decoration: none;
          transition:
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .hot-button:hover {
          transform: translateY(-2px);
        }

        .hot-text,
        .fire-icon {
          position: relative;
          z-index: 5;
        }

        .hot-text {
          color: white;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .fire-icon {
          font-size: 13px;
          transform-origin: center bottom;
        }

        /* OPTION 1: MOVING FIRE GRADIENT */

        .hot-1 {
          background: linear-gradient(
            90deg,
            #991b1b,
            #ef4444,
            #f97316,
            #facc15,
            #ef4444,
            #991b1b
          );
          background-size: 300% 100%;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          animation: moving-gradient 2.5s linear infinite;
        }

        .hot-1 .fire-icon {
          animation: fire-flicker 0.65s ease-in-out infinite alternate;
        }

        /* OPTION 2: LUXURY EMBER GLOW */

        .hot-2 {
          background: #111111;
          border: 1px solid rgba(251, 146, 60, 0.8);
          box-shadow:
            inset 0 0 15px rgba(239, 68, 68, 0.2),
            0 0 12px rgba(249, 115, 22, 0.25);
        }

        .hot-2::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 120%,
            #f97316 0%,
            #991b1b 35%,
            transparent 72%
          );
          animation: ember-glow 1.4s ease-in-out infinite alternate;
        }

        .hot-2 .hot-text {
          color: #fff7ed;
        }

        .hot-2 .fire-icon {
          animation: ember-icon 1s ease-in-out infinite alternate;
        }

        /* OPTION 3: FLAMES MOVING INSIDE BUTTON */

        .hot-3 {
          background: linear-gradient(to top, #991b1b, #ef4444);
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
        }

        .hot-3 .flames {
          position: absolute;
          bottom: -20px;
          left: -8px;
          width: 30px;
          height: 40px;
          border-radius: 50% 50% 35% 35%;
          background: #facc15;
          filter: blur(2px);
          box-shadow:
            24px -7px 0 #f97316,
            48px 2px 0 #facc15,
            72px -10px 0 #fb923c,
            96px 0 0 #facc15,
            120px -8px 0 #f97316;
          animation: flame-wave 0.8s ease-in-out infinite alternate;
        }

        .hot-3::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(153, 27, 27, 0.25),
            transparent
          );
        }

        .hot-3 .fire-icon {
          display: none;
        }

        /* OPTION 4: ANIMATED BURNING BORDER */

        .hot-4 {
          background: #111111;
          padding: 2px;
        }

        .hot-4::before {
          content: "";
          position: absolute;
          z-index: -2;
          width: 180%;
          height: 500%;
          background: conic-gradient(
            transparent,
            #ef4444,
            #facc15,
            #f97316,
            transparent 35%
          );
          animation: border-spin 2.2s linear infinite;
        }

        .hot-4::after {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 2px;
          border-radius: 2px;
          background: #111111;
        }

        .hot-4 .fire-icon {
          animation: fire-flicker 0.7s ease-in-out infinite alternate;
        }

        /* OPTION 5: CLEAN OATCLUB STYLE */

        .hot-5 {
          border-radius: 0;
          background: #000000;
          box-shadow: 0 0 0 rgba(239, 68, 68, 0);
          animation: minimal-pulse 1.6s ease-in-out infinite;
        }

        .hot-5::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 20%,
            rgba(239, 68, 68, 0.5) 45%,
            rgba(249, 115, 22, 0.8) 50%,
            transparent 75%
          );
          transform: translateX(-130%);
          animation: heat-shine 2.4s ease-in-out infinite;
        }

        .hot-5 .fire-icon {
          animation: fire-flicker 0.8s ease-in-out infinite alternate;
        }

        @keyframes moving-gradient {
          from {
            background-position: 0% 50%;
          }
          to {
            background-position: 300% 50%;
          }
        }

        @keyframes fire-flicker {
          from {
            transform: rotate(-8deg) scale(0.9);
          }
          to {
            transform: rotate(7deg) scale(1.15);
          }
        }

        @keyframes ember-glow {
          from {
            opacity: 0.5;
            transform: scaleY(0.8);
          }
          to {
            opacity: 1;
            transform: scaleY(1.15);
          }
        }

        @keyframes ember-icon {
          from {
            filter: drop-shadow(0 0 1px #f97316);
            transform: scale(0.92);
          }
          to {
            filter: drop-shadow(0 0 5px #facc15);
            transform: scale(1.12);
          }
        }

        @keyframes flame-wave {
          from {
            transform: translateY(6px) rotate(-3deg) scaleY(0.85);
          }
          to {
            transform: translateY(-5px) rotate(4deg) scaleY(1.18);
          }
        }

        @keyframes border-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes minimal-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(239, 68, 68, 0);
          }
          50% {
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          }
        }

        @keyframes heat-shine {
          0%,
          25% {
            transform: translateX(-130%);
          }
          65%,
          100% {
            transform: translateX(130%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hot-button,
          .hot-button::before,
          .hot-button::after,
          .hot-button .flames,
          .hot-button .fire-icon {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
