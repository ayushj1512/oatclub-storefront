"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import ScrollToTop from "@/components/layout/ScrollToTop";

export default function AppClientBoot() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize?.();
  }, [initialize]);

  return <ScrollToTop />;
}
