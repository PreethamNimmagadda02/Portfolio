"use client";

import { useEffect } from "react";

const isDev = process.env.NODE_ENV === "development";

function log(msg: string) {
  if (isDev) console.log(msg);
}

/**
 * Measures Core Web Vitals (FCP, LCP, CLS, TTFB) and logs them in development.
 * In production this is a no-op — no console pollution for real users.
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (!isDev || typeof window === "undefined") return;

    // FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries().find((e) => e.name === "first-contentful-paint");
      if (entry) log(`[Perf] FCP: ${Math.round(entry.startTime)}ms`);
    });

    // LCP — update on each new candidate, final value is what matters
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const last = entries[entries.length - 1];
        log(`[Perf] LCP candidate: ${Math.round(last.startTime)}ms`);
      }
    });

    // CLS — accumulate all non-input-triggered shifts
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      log(`[Perf] CLS (running): ${clsValue.toFixed(3)}`);
    });

    try {
      fcpObserver.observe({ type: "paint", buffered: true });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // PerformanceObserver not supported in all browsers
    }

    // TTFB from Navigation Timing API
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    navEntries.forEach((entry) => {
      log(`[Perf] TTFB: ${Math.round(entry.responseStart - entry.startTime)}ms`);
    });

    // Total page load time (after all resources)
    const onLoad = () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (timing) log(`[Perf] Total load: ${Math.round(timing.duration)}ms`);
      }, 0);
    };
    window.addEventListener("load", onLoad);

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, []);
}
