"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { trackMeta } from "@/lib/meta/track";

export default function MetaPixel({
  pixelId,
  trackPageView = true,
  debug = false,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lastTrackedUrlRef = useRef("");

  const cleanedPixelId = useMemo(
    () => (typeof pixelId === "string" ? pixelId.trim() : ""),
    [pixelId]
  );

  const url = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!trackPageView || !cleanedPixelId || !url) return;
    if (lastTrackedUrlRef.current === url) return;

    let attempts = 0;
    let timer;

    const sendPageView = async () => {
      attempts += 1;

      if (
        typeof window === "undefined" ||
        typeof window.fbq !== "function"
      ) {
        if (attempts < 20) {
          timer = window.setTimeout(sendPageView, 150);
        }

        return;
      }

      if (lastTrackedUrlRef.current === url) return;

      lastTrackedUrlRef.current = url;

      try {
        await trackMeta("PageView", {
          page_path: url,
          page_location: window.location.href,
          page_title: document.title,
        });

        if (debug) {
          console.log("✅ Meta PageView tracked:", url);
        }
      } catch (error) {
        console.warn("Meta PageView failed:", error);
        lastTrackedUrlRef.current = "";
      }
    };

    sendPageView();

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [url, trackPageView, cleanedPixelId, debug]);

  if (!cleanedPixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(f,b,e,v,n,t,s){
              if(f.fbq) return;

              n=f.fbq=function(){
                n.callMethod
                  ? n.callMethod.apply(n,arguments)
                  : n.queue.push(arguments);
              };

              if(!f._fbq) f._fbq=n;

              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];

              t=b.createElement(e);
              t.async=!0;
              t.src=v;

              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s);
            })(
              window,
              document,
              'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );

            if (!window.__META_PIXEL_LOADED__) {
              window.__META_PIXEL_LOADED__ = true;
              window.__META_PIXEL_ID__ = '${cleanedPixelId}';
              fbq('init', '${cleanedPixelId}');
            }
          `,
        }}
      />

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