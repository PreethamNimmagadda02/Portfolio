"use client";

import { usePerformanceMonitoring } from "@/lib/performance-monitoring";

export default function PerformanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  usePerformanceMonitoring();
  return <>{children}</>;
}
