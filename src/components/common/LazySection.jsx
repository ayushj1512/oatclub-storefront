"use client";

import { useEffect, useRef, useState } from "react";

export default function LazySection({
  children,
  rootMargin = "300px",
  minHeight = 300,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <section
      ref={ref}
      style={{
        minHeight, // 🔥 ALWAYS occupies space → scroll works
      }}
      className="w-full"
    >
      {visible ? (
        children
      ) : (
        // 🔥 placeholder (invisible but gives height)
        <div className="w-full h-full" />
      )}
    </section>
  );
}
