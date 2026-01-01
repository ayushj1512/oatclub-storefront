"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GTMPageView({ dataLayerName = "dataLayer" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");

    window[dataLayerName] = window[dataLayerName] || [];
    window[dataLayerName].push({
      event: "pageview",
      page: url,
    });

    console.log("✅ GTM pageview pushed:", url);
  }, [pathname, searchParams, dataLayerName]);

  return null;
}
