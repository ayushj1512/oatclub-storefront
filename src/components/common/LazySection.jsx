// src/components/common/LazySection.jsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function LazySection({ children, rootMargin = "200px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
}
