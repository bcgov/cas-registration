export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentryServer } = await import("@bciers/sentryConfig/sentry");
    initSentryServer("administration");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initSentryEdge } = await import("@bciers/sentryConfig/sentry");
    initSentryEdge("administration");
  }
}
