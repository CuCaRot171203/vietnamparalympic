"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Smooth scroll helpers that fall back to the native API
 * when Lenis is not running (e.g. inside the admin panel).
 */
export function scrollToTop(offset = 0) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { offset, force: true });
    return;
  }
  window.scrollTo({ top: offset, behavior: "smooth" });
}

export function scrollToPosition(top: number, immediate = false) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { immediate, force: true });
    return;
  }
  window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The admin panel has its own inner scroll containers — keep native scrolling there.
  const isPublic = !pathname?.includes("/admin");
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isPublic) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });

    instance = lenis;

    return () => {
      instance = null;
      lenis.destroy();
    };
  }, [isPublic]);

  useEffect(() => {
    if (!isPublic) return;
    // Sync Lenis with the router scroll restoration on navigation (skip the first render).
    if (previousPath.current !== null && previousPath.current !== pathname) {
      if (!window.location.hash) {
        getLenis()?.scrollTo(0, { immediate: true, force: true });
      }
    }
    previousPath.current = pathname;
  }, [pathname, isPublic]);

  return <>{children}</>;
}
