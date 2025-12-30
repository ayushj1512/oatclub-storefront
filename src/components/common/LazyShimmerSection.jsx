"use client";

import { useEffect, useRef, useState } from "react";
import Shimmer from "./Shimmer";

export default function LazyShimmerSection({
  children,
  shimmerHeight = 300,
  rootMargin = "400px",
}) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <section ref={ref} className="w-full">
      {ready ? children : <Shimmer height={shimmerHeight} />}
    </section>
  );
}
