"use client";

import { useEffect, useState } from "react";

const IST = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * The time in Hyderabad as "HH:MM", or null before mount. The server's clock
 * and the reader's would disagree on hydration, so nothing is rendered until
 * the client has its own reading. Refreshed every twenty seconds: it is a
 * courtesy that says what hour a message lands in, not a clock face.
 */
export function useLocalTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(IST.format(new Date()));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
