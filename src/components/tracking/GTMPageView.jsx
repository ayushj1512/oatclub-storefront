"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function GTMPageView({
  dataLayerName = "dataLayer",
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef("");

  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;

    const queryString = searchParams?.toString();

    const pagePath = queryString
      ? `${pathname}?${queryString}`
      : pathname;

    if (lastTrackedUrl.current === pagePath) return;

    lastTrackedUrl.current = pagePath;

    if (!Array.isArray(window[dataLayerName])) {
      window[dataLayerName] = [];
    }

    window[dataLayerName].push({
      event: "page_view",
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ GTM page_view pushed:", pagePath);
    }
  }, [pathname, searchParams, dataLayerName]);

  return null;
}