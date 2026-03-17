---
applyTo: "**/*.{js,jsx,ts,tsx}"
---

# React + Next.js Performance Review Rules (Vercel React Best Practices)

Apply these rules when reviewing React/Next.js code changes. Flag violations and suggest fixes.

## 1) Eliminating waterfalls (CRITICAL)

- async-defer-await: move `await` into branches where used
- async-parallel: use `Promise.all()` for independent work
- async-api-routes: start promises early, await late in API routes
- async-suspense-boundaries: use Suspense/streaming when appropriate

## 2) Bundle size optimization (CRITICAL)

- bundle-barrel-imports: import directly; avoid barrel imports that pull extra code
- bundle-dynamic-imports: use `next/dynamic` for heavy/rarely used components
- bundle-defer-third-party: load analytics/logging after hydration where possible
- bundle-conditional: load modules only when a feature is activated
- bundle-preload: preload on hover/focus when it improves perceived speed

## 3) Server-side performance (HIGH)

- server-auth-actions: authenticate server actions like API routes
- server-cache-react: use `React.cache()` for per-request dedup where applicable
- server-serialization: minimize data passed into client components
- server-parallel-fetching: restructure to parallelize fetches
- server-after-nonblocking: use `after()` for non-blocking work when appropriate

## 4) Client-side data fetching (MEDIUM-HIGH)

- client-swr-dedup: prefer SWR (or equivalent) for request dedup
- client-event-listeners: deduplicate global event listeners
- client-passive-event-listeners: use passive listeners for scroll/touch where safe
- client-localstorage-schema: version + minimize localStorage payloads

## 5) Re-render optimization (MEDIUM)

- rerender-dependencies: keep effect deps primitive/stable
- rerender-derived-state(-no-effect): derive state during render when possible
- rerender-memo: memoize only expensive components/work
- rerender-use-ref-transient-values: use refs for frequently changing transient values
- rerender-transitions: use `startTransition` for non-urgent updates

## 6) Rendering performance (MEDIUM)

- rendering-content-visibility: use `content-visibility` for long lists where applicable
- rendering-hoist-jsx: hoist static JSX outside components
- rendering-hydration-no-flicker: avoid hydration flicker patterns
- rendering-conditional-render: prefer ternary over `&&` when it improves clarity

## 7) JavaScript performance (LOW-MEDIUM)

- js-set-map-lookups: prefer Set/Map for O(1) lookups in hot paths
- js-combine-iterations: avoid multiple passes when one loop is enough
- js-cache-property-access: cache repeated property access in loops
- js-early-exit: return early from functions to reduce work

## What to flag

- Any new sequential awaits that can be parallelized
- New barrel imports that increase bundle
- Client components receiving large server data props
- Unnecessary re-renders due to unstable props/deps
