"use client";

import { useEffect } from "react";
import { clarityInit } from "@/store/clarityStore";

export default function ClarityProvider() {
  useEffect(() => {
    clarityInit();
  }, []);

  return null;
}
