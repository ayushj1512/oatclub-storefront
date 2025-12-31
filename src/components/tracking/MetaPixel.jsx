"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function MetaPixel({
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

  if (!cleanedPixelId) {
    console.warn("⚠️ Meta Pixel ID is missing");
    return null;
  }

  // Track PageView on SPA navigation
  useEffect(() => {
    if (!trackPageView) return;

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
      if (debug) console.log("✅ Meta Pixel: PageView tracked", url);
    }
  }, [url, trackPageView, debug]);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(f,b,e,v,n,t,s){
              if(f.fbq) return;
              n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq) f._fbq=n;
              n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
              t=b.createElement(e); t.async=!0; t.src=v;
              s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
            })(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

            // Init only once
            window.__META_PIXEL_ID__ = window.__META_PIXEL_ID__ || '${cleanedPixelId}';
            if (!window.__META_PIXEL_LOADED__) {
              window.__META_PIXEL_LOADED__ = true;
              fbq('init', '${cleanedPixelId}');
              ${trackPageView ? "fbq('track', 'PageView');" : ""}
            }
          `,
        }}
      />

      {/* Must be plain <img> for noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${cleanedPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
