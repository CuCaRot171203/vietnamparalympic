"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import floating from "./floating-controls.module.css";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        })
      }
      className={`${floating.anchor} ${floating.button} ${floating.backToTop} bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--focus-ring)] focus:ring-offset-2 cursor-pointer`}
      aria-label="Cuộn lên đầu trang"
    >
      <ArrowUp size={20} />
    </button>
  );
}
