import * as Sentry from "@sentry/nextjs";
import { makeMultiplexedTransport } from "@sentry/core";
import { makeFetchTransport } from "@sentry/browser";

const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

const ENABLED_ENVIRONMENTS = ["prod", "test", "local"] as const;
const shouldEnableSentry = (env: string | undefined) =>
  env !== undefined &&
  ENABLED_ENVIRONMENTS.includes(env as (typeof ENABLED_ENVIRONMENTS)[number]);

const SENTRY_DSN = shouldEnableSentry(SENTRY_ENVIRONMENT)
  ? "https://c097ce7d51760bab348fa0608eea9870@o646776.ingest.sentry.io/4506621387407360"
  : undefined;

const SENTRY_TRACE_SAMPLE_RATE = process.env.SENTRY_TRACE_SAMPLE_RATE ?? "0";
const BETTERSTACK_DSN =
  "https://PMxJxuJckRJw1GxX7jTSgckw@s1603661.eu-nbg-2.betterstackdata.com/1603661";

/**
 * Get list of DSNs for multiplexed transport.
 * In test and local environments, sends to both Sentry and BetterStack.
 * Note: Frontend uses multiplexed transport (simpler for Next.js),
 * while backend uses separate clients.
 */
function getDsnList(): string[] {
  if (
    (SENTRY_ENVIRONMENT === "test" || SENTRY_ENVIRONMENT === "local") &&
    SENTRY_DSN
  ) {
    return [SENTRY_DSN, BETTERSTACK_DSN];
  }
  return SENTRY_DSN ? [SENTRY_DSN] : [];
}

/**
 * Get base Sentry configuration options shared across all runtimes.
 */
function getBaseSentryOptions(appName: string) {
  const dsnList = getDsnList();

  return {
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    // Use multiplexed transport to send to both Sentry and BetterStack in test and local environments
    // (Frontend uses multiplexed transport, backend uses separate clients)
    transport:
      dsnList.length > 1
        ? makeMultiplexedTransport(makeFetchTransport, () => dsnList)
        : undefined,
    beforeSend(event: Sentry.Event) {
      event.tags = { ...event.tags, app: appName };
      return event;
    },
  };
}


export function initSentryClient(appName: string) {
  Sentry.init(getBaseSentryOptions(appName));
}

export function initSentryServer(appName: string) {
  Sentry.init(getBaseSentryOptions(appName));
}

export function initSentryEdge(appName: string) {
  Sentry.init(getBaseSentryOptions(appName));
}

/**
 * Capture exception to both Sentry and BetterStack (if in test or local environment)
 * The multiplexed transport automatically sends to both DSNs, so we just need to use the standard Sentry API
 * @param error The error to capture
 * @param userGuid Optional user GUID to set as user context
 * @returns The Sentry event ID
 */
export function captureException(
  error: Error,
  userGuid?: string,
): string | undefined {
  // Use withScope to ensure user context is included in the event
  return Sentry.withScope((scope) => {
    if (userGuid) {
      scope.setUser({ id: userGuid });
    }
    // The multiplexed transport will automatically send to both Sentry and BetterStack in test and local environments
    return Sentry.captureException(error);
  });
}
