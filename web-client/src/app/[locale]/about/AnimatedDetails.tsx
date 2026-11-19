"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export default function AnimatedDetails({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const expandedRef = useRef(false);

  useEffect(() => () => animationRef.current?.cancel(), []);

  function toggle() {
    const details = detailsRef.current;
    const summary = summaryRef.current;
    if (!details || !summary) return;

    const startHeight = details.getBoundingClientRect().height;
    const expanded = !expandedRef.current;
    expandedRef.current = expanded;
    animationRef.current?.cancel();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = expanded;
      return;
    }

    details.open = true;
    const borderHeight = details.offsetHeight - details.clientHeight;
    const endHeight = expanded
      ? details.getBoundingClientRect().height
      : summary.getBoundingClientRect().height + borderHeight;
    const animation = details.animate(
      [{ height: startHeight + "px" }, { height: endHeight + "px" }],
      { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = expanded;
      animationRef.current = null;
    };
  }

  return (
    <details ref={detailsRef} style={{ overflow: "hidden" }}>
      <summary
        ref={summaryRef}
        onClick={(event) => {
          event.preventDefault();
          toggle();
        }}
      >
        {title}
      </summary>
      <div>{children}</div>
    </details>
  );
}
