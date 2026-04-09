"use client";

import Script from "next/script";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function SnapPixel({
  pixelId,
  trackPageView = true,
  debug = false,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cleanedPixelId = useMemo(
    () => (typeof pixelId === "string" ? pixelId.trim() : ""),
    [pixelId]
  );

  const url = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const noscriptSrc = useMemo(() => {
    const pid = encodeURIComponent(cleanedPixelId || "");
    return `https://tr.snapchat.com/p?pid=${pid}&ev=PAGE_VIEW&noscript=1`;
  }, [cleanedPixelId]);

  useEffect(() => {
    if (!trackPageView) return;
    if (typeof window === "undefined") return;
    if (typeof window.snaptr !== "function") return;

    window.snaptr("track", "PAGE_VIEW");

    if (debug) {
      console.log("✅ Snap Pixel: PAGE_VIEW tracked", url);
    }
  }, [url, trackPageView, debug]);

  if (!cleanedPixelId) {
    console.warn("⚠️ Snapchat Pixel ID is missing");
    return null;
  }

  return (
    <>
      <Script
        id="snap-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(e,t,n){
              if(e.snaptr) return;
              var a=e.snaptr=function(){
                a.handleRequest
                  ? a.handleRequest.apply(a,arguments)
                  : a.queue.push(arguments);
              };
              a.queue=[];
              var s=t.createElement("script");
              s.async=true;
              s.src=n;
              var r=t.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(s,r);
            })(window,document,"https://sc-static.net/scevent.min.js");

            window.__SNAP_PIXEL_ID__ = window.__SNAP_PIXEL_ID__ || '${cleanedPixelId}';

            if (!window.__SNAP_PIXEL_LOADED__) {
              window.__SNAP_PIXEL_LOADED__ = true;
              snaptr("init", "${cleanedPixelId}");
            }
          `,
        }}
      />

      <noscript>
        <span style={{ display: "none" }}>
          <Image
            src={noscriptSrc}
            alt=""
            width={1}
            height={1}
            unoptimized
            priority
          />
        </span>
      </noscript>
    </>
  );
}