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

  const initializedRef = useRef(false);
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
    if (!trackPageView || !initializedRef.current) return;
    if (!url || lastTrackedUrlRef.current === url) return;

    lastTrackedUrlRef.current = url;

    trackMeta("PageView", {
      page_path: url,
    }).catch((error) => {
      console.warn("Meta PageView failed:", error);
    });

    if (debug) {
      console.log("✅ Meta PageView tracked:", url);
    }
  }, [url, trackPageView, debug]);

  if (!cleanedPixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          initializedRef.current = true;

          if (
            trackPageView &&
            url &&
            lastTrackedUrlRef.current !== url
          ) {
            lastTrackedUrlRef.current = url;

            trackMeta("PageView", {
              page_path: url,
            }).catch((error) => {
              console.warn("Meta PageView failed:", error);
            });

            if (debug) {
              console.log("✅ Meta initial PageView tracked:", url);
            }
          }
        }}
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

            window.__META_PIXEL_ID__ =
              window.__META_PIXEL_ID__ || '${cleanedPixelId}';

            if (!window.__META_PIXEL_LOADED__) {
              window.__META_PIXEL_LOADED__ = true;
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