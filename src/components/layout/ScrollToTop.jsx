"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={scrollToTop}
        className={`flex items-center justify-center 
          w-12 h-12 rounded-full shadow-lg transition-all duration-300 
          bg-[#800020] text-white hover:bg-[#a0002a]
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
        `}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}
