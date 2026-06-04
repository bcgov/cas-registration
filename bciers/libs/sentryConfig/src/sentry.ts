import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

// Sentry configuration (for prod and test environments)
const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

const SENTRY_TRACE_SAMPLE_RATE = process.env.SENTRY_TRACE_SAMPLE_RATE ?? "0";

const ENABLE_SENTRY =
  SENTRY_ENVIRONMENT === "prod" || SENTRY_ENVIRONMENT === "test";

const SENTRY_DSN = ENABLE_SENTRY
  ? "https://c097ce7d51760bab348fa0608eea9870@o646776.ingest.sentry.io/4506621387407360"
  : undefined;

function getBaseSentryOptions(appName: string) {
  return {
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
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
 * Capture exception to Sentry
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

// onRequestError hook for Next.js 16 - captures server-side errors from React Server Components
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        nextjs: {
          request: { path: request.path, method: request.method },
          router: context.routerKind,
          route: context.routePath,
          type: context.routeType,
        },
      },
    });
  }
};
