import { useMediaQuery } from "@/lib/viewport-store"

const MOBILE_BREAKPOINT = 768

/**
 * `true` below the mobile breakpoint. Backed by the shared media-query store,
 * so the many client-only components that call this reuse a single
 * `MediaQueryList` and listener rather than each allocating their own.
 *
 * The synchronous initial value is preserved: `useSyncExternalStore` reads the
 * live `matchMedia` result on the client during render, so phones never get a
 * throwaway desktop-flavored first paint (which previously created and
 * destroyed a WebGL context).
 */
export function useIsMobile() {
    return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, false)
}
