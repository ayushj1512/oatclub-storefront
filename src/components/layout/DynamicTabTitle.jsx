"use client";

import { useEffect, useRef } from "react";

const TAB_MESSAGES = [
  "👀 Your edit is waiting",
  "🔥 Fresh fits just dropped",
  "🖤 Still thinking about it?",
  "✨ Own the trend",
  "🛍️ Come back to your cart",
  "💌 We saved your style",
  "⚡ New looks move fast",
];

export default function DynamicTabTitle({ interval = 1800 }) {
  const originalTitleRef = useRef("");
  const timerRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const clearTitleTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const restoreTitle = () => {
      clearTitleTimer();
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
      originalTitleRef.current = "";
      indexRef.current = 0;
    };

    const rotateTitle = () => {
      document.title = TAB_MESSAGES[indexRef.current % TAB_MESSAGES.length];
      indexRef.current += 1;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!originalTitleRef.current) {
          originalTitleRef.current = document.title;
        }
        clearTitleTimer();
        rotateTitle();
        timerRef.current = window.setInterval(rotateTitle, interval);
        return;
      }

      restoreTitle();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      restoreTitle();
    };
  }, [interval]);

  return null;
}
