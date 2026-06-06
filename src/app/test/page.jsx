"use client";

import { useEffect, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import OatclubOverlayLoader from "@/components/common/OatclubOverlayLoader";

export default function TestPage() {
  const [showLoader, setShowLoader] = useState(true);

  const replayLoader = () => {
    setShowLoader(true);
    window.setTimeout(() => setShowLoader(false), 2600);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen bg-[#f7f7f5] px-3 py-4 text-black sm:px-5 sm:py-8">
      <OatclubOverlayLoader show={showLoader} />

      <div className="w-full space-y-4">
        <header className="grid border border-neutral-200 bg-white lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="bg-black p-5 text-white sm:p-8">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
              <Sparkles size={14} />
              LOADER TEST LAB
            </p>
            <h1 className="mt-5 text-3xl font-black uppercase leading-none sm:text-5xl">
              OATCLUB OVERLAY LOADER.
            </h1>
            <p className="mt-4 max-w-2xl text-xs font-bold uppercase leading-6 tracking-[0.09em] text-white/62">
              SAMPLE ONLY. THIS IS NOT MOUNTED GLOBALLY YET. TEST THE FEEL,
              TIMING, COPY AND MOTION HERE FIRST.
            </p>
          </div>

          <div className="flex flex-col justify-between border-t border-neutral-200 bg-white p-4 lg:border-l lg:border-t-0 lg:p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
                PREVIEW CONTROL
              </p>
              <p className="mt-3 text-sm font-black uppercase leading-6 tracking-[0.08em] text-black">
                FULL SCREEN, CLIENT ONLY, CLEANUP READY.
              </p>
            </div>

            <button
              type="button"
              onClick={replayLoader}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
            >
              <Play size={15} />
              REPLAY LOADER
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["STYLE", "MINIMAL FASHION-FOCUSED COPY"],
            ["MOTION", "DOTS PLUS A THIN PROGRESS SWEEP"],
            ["SAFETY", "NO SERVER RUN, TIMER CLEARS CLEANLY"],
          ].map(([title, text]) => (
            <div key={title} className="border border-neutral-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/42">
                {title}
              </p>
              <p className="mt-3 text-xs font-black uppercase leading-6 tracking-[0.08em] text-black">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="border border-neutral-200 bg-white p-4 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
            SAMPLE PAGE BEHIND LOADER
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["DRESSES", "TOPS", "BOTTOMS", "CO-ORD SETS"].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="flex h-full items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-black/55">
                    {item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
