"use client";

import { useEffect } from "react";
import { initializeMetaParameters } from "@/lib/meta/track";

export default function MetaParameterInitializer() {
  useEffect(() => {
    initializeMetaParameters().catch(() => {});
  }, []);

  return null;
}