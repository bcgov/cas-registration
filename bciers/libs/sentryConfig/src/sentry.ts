import * as Sentry from "@sentry/nextjs";

// Sentry configuration (for prod and test environments)
const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

const SENTRY_TRACE_SAMPLE_RATE = process.env.SENTRY_TRACE_SAMPLE_RATE ?? "0";

const ENABLE_SENTRY =
  SENTRY_ENVIRONMENT === "prod" || SENTRY_ENVIRONMENT === "test";

const SENTRY_DSN = ENABLE_SENTRY
  ? "https://c097ce7d51760bab348fa0608eea9870@o646776.ingest.sentry.io/4506621387407360"
  : undefined;

// BetterStack configuration (for dev environment only)
const ENVIRONMENT =
  process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT;
const ENABLE_BETTERSTACK = ENVIRONMENT === "dev";
const BETTERSTACK_DSN = ENABLE_BETTERSTACK
  ? "https://PMxJxuJckRJw1GxX7jTSgckw@s1603661.eu-nbg-2.betterstackdata.com/1603661"
  : undefined;

/**
 * Get base error tracking configuration options shared across all runtimes.
 * - Sentry: enabled for prod and test environments
 * - BetterStack: enabled for dev environment only
 */
function getBaseSentryOptions(appName: string) {
  // Use BetterStack for dev, Sentry for prod/test
  const dsn = BETTERSTACK_DSN || SENTRY_DSN;
  const environment = ENABLE_BETTERSTACK ? "dev" : SENTRY_ENVIRONMENT;

  return {
    dsn,
    environment,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    beforeSend(event: Sentry.Event) {
      event.tags = { ...event.tags, app: appName };
      return event;
    },
  } as Sentry.NodeOptions;
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
 * Capture exception to Sentry (prod/test) or BetterStack (dev)
 * @param error The error to capture
 * @param userGuid Optional user GUID to set as user context
 * @returns The event ID
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
    return Sentry.captureException(error);
  });
}
