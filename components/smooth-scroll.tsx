"use client";

import { ReactLenis, useLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import "lenis/dist/lenis.css";

// Keeps Lenis internal scroll height synchronized with the true document height
// whenever dynamic content (telemetry, contribution calendar, images, 3D assets) loads.
function LenisResizeWatcher() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Immediately trigger measurement
    lenis.resize();

    const handleResize = () => {
      lenis.resize();
    };

    window.addEventListener("resize", handleResize);

    // Observe body size changes dynamically
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      observer = new ResizeObserver(() => {
        lenis.resize();
      });
      observer.observe(document.body);
    }

    // Interval checks across initial lifecycle to catch late-mounting components
    const timers = [50, 200, 500, 1000, 2000, 3500].map((delay) =>
      setTimeout(() => {
        lenis.resize();
      }, delay)
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        autoResize: true,
      }}
    >
      <LenisResizeWatcher />
      {children}
    </ReactLenis>
  );
}
