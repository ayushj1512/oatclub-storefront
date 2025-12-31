"use client";

import Script from "next/script";

/**
 * Google Tag Manager (GTM) for Next.js
 *
 * ✅ Improvements:
 * - Supports custom dataLayer name (default: "dataLayer")
 * - Prevents double init on client remounts/navigation
 * - Sanitizes gtmId (basic)
 * - Keeps script loading non-blocking (afterInteractive)
 * - Exposes optional initialDataLayer pushes
 *
 * Usage:
 * <GoogleTagManager gtmId="GTM-XXXXXXX" />
 *
 * Optional:
 * <GoogleTagManager
 *   gtmId="GTM-XXXXXXX"
 *   dataLayerName="dataLayer"
 *   initialDataLayer={{ userId: "123", env: "prod" }}
 * />
 */
export default function GoogleTagManager({
  gtmId,
  dataLayerName = "dataLayer",
  initialDataLayer,
}) {
  const cleanedGtmId = typeof gtmId === "string" ? gtmId.trim() : "";

  if (!cleanedGtmId) {
    console.warn("⚠️ GTM ID is missing");
    return null;
  }

  // Optional: push initial dataLayer values before GTM loads
  const initialPush =
    initialDataLayer && typeof initialDataLayer === "object"
      ? `
        window.${dataLayerName} = window.${dataLayerName} || [];
        window.${dataLayerName}.push(${JSON.stringify(initialDataLayer)});
      `
      : "";

  return (
    <>
      {/* ✅ Ensure dataLayer exists + optional initial values */}
      <Script
        id="gtm-datalayer-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.${dataLayerName} = window.${dataLayerName} || [];
            ${initialPush}
          `,
        }}
      />

      {/* ✅ Load GTM once */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              // Avoid double-init if this component mounts more than once
              if (w.__GTM_LOADED__) return;
              w.__GTM_LOADED__ = true;

              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','${dataLayerName}','${cleanedGtmId}');
          `,
        }}
      />

      {/* ✅ NoScript fallback
          NOTE: Best practice is to place this immediately after <body> in app/layout.js.
          Keeping it here for convenience. */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${cleanedGtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="gtm"
        />
      </noscript>
    </>
  );
}
