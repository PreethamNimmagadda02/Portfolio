import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
    // Synchronous initial value: consumers are all client-only (ssr:false)
    // components, so reading matchMedia in the initializer is hydration-safe
    // and prevents a throwaway desktop-flavored first render on phones
    // (which previously created and destroyed a WebGL context).
    const [isMobile, setIsMobile] = React.useState(() =>
        typeof window !== "undefined"
            ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
            : false
    )

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

        const onChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches)
        }

        mql.addEventListener("change", onChange)

        return () => mql.removeEventListener("change", onChange)
    }, [])

    return isMobile
}
