"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { trackMeta } from "@/lib/meta/track";
import { useAuthStore } from "@/store/authStore";

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return {
    fn: parts[0] || undefined,
    ln: parts.slice(1).join(" ") || undefined,
  };
};

const sleep = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export default function MetaPixel({
  pixelId,
  trackPageView = true,
  debug = false,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const user = useAuthStore((state) => state.user);
  const customer = useAuthStore((state) => state.customer);

  const lastTrackedUrlRef = useRef("");
  const processingUrlRef = useRef("");

  const cleanedPixelId = useMemo(
    () => String(pixelId || "").trim(),
    [pixelId],
  );

  const url = useMemo(() => {
    const query = searchParams?.toString();

    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const metaUserData = useMemo(() => {
    const fullName = customer?.name || user?.name || "";
    const { fn, ln } = splitName(fullName);

    return {
      em: customer?.email || user?.email || undefined,
      ph: customer?.phone || user?.phone || undefined,

      fn,
      ln,

      ct:
        customer?.city ||
        customer?.address?.city ||
        undefined,

      st:
        customer?.state ||
        customer?.address?.state ||
        undefined,

      zp:
        customer?.postcode ||
        customer?.pincode ||
        customer?.zip ||
        customer?.address?.pincode ||
        undefined,

      country:
        customer?.countryCode ||
        customer?.country ||
        customer?.address?.countryCode ||
        "IN",

      external_id:
        customer?._id ||
        customer?.customerId ||
        user?._id ||
        user?.uid ||
        undefined,
    };
  }, [customer, user]);

  useEffect(() => {
    if (!trackPageView || !cleanedPixelId || !url) return;
    if (lastTrackedUrlRef.current === url) return;
    if (processingUrlRef.current === url) return;

    let cancelled = false;

    const sendPageView = async () => {
      processingUrlRef.current = url;

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        if (cancelled) return;

        const result = await trackMeta(
          "PageView",
          {
            page_path: url,
            page_location: window.location.href,
            page_title: document.title,
          },
          metaUserData,
          {
            throwOnCapiFailure: true,
          },
        ).catch((error) => ({
          success: false,
          error,
        }));

        if (result?.success) {
          lastTrackedUrlRef.current = url;
          processingUrlRef.current = "";

          if (debug) {
            console.log("✅ Meta PageView tracked:", {
              url,
              eventId: result.eventId,
              pixelSent: result.pixelSent,
              capiSent: result.capiSent,
              externalId: metaUserData.external_id,
            });
          }

          return;
        }

        if (debug) {
          console.warn(`Meta PageView attempt ${attempt} failed:`, {
            url,
            result,
          });
        }

        if (attempt < 3) {
          await sleep(attempt * 500);
        }
      }

      processingUrlRef.current = "";

      console.warn("Meta PageView failed after retries:", {
        url,
      });
    };

    sendPageView();

    return () => {
      cancelled = true;

      if (processingUrlRef.current === url) {
        processingUrlRef.current = "";
      }
    };
  }, [
    url,
    trackPageView,
    cleanedPixelId,
    debug,
    metaUserData,
  ]);

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