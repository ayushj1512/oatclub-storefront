// src/app/test/page.jsx
"use client";

import UniversalLuxuryLoader from "@/components/common/UniversalLuxuryLoader";

export default function TestLoaderPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F6F6F8]">
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.10)] px-8 py-10">
        
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
          Universal Luxury Loader Preview
        </h1>

        <UniversalLuxuryLoader interval={2200} />

        <p className="text-xs text-gray-500 text-center max-w-sm">
          This is a test preview page for the loader component.  
          You can adjust the interval prop to see text cycling speed.
        </p>
      </div>
    </main>
  );
}
