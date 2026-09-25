/**
 * A small timestamped localStorage cache for the live figures (GitHub and
 * Codolio). Entries are stored as `{ timestamp, ...data }`. Storage can be
 * unavailable or full (private windows, quota, blocked site data), so every
 * access is guarded: a failed read is a miss, a failed write is dropped.
 */

export function readCache<T extends object>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, ...data } = JSON.parse(raw) as { timestamp?: number } & T;
    if (typeof timestamp !== "number" || Date.now() - timestamp >= ttlMs) return null;
    return data as unknown as T;
  } catch {
    return null;
  }
}

export function writeCache<T extends object>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), ...data }));
  } catch {
    // Storage refused: the figures are already on screen, so there is nothing to recover.
  }
}
