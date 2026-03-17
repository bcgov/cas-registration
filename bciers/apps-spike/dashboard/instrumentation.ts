export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentryServer } = await import("@bciers/sentryConfig/sentry");
    initSentryServer("dashboard");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initSentryEdge } = await import("@bciers/sentryConfig/sentry");
    initSentryEdge("dashboard");
  }
}

// Export onRequestError hook for Next.js 16 error handling
export { onRequestError } from "@bciers/sentryConfig/sentry";
