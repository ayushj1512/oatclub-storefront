"use client";

import { useEffect, useRef, useState } from "react";

export default function LazySection({
  children,
  rootMargin = "300px",
  minHeight = 200, // 👈 important
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // 🔥 once loaded, stop observing
        }
      },
      {
        rootMargin,
        threshold: 0.01, // 👈 mobile friendly
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: visible ? "auto" : minHeight,
      }}
    >
      {visible ? children : null}
    </div>
  );
}
