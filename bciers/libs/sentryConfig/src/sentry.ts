import * as Sentry from "@sentry/nextjs";

// const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;
const SENTRY_ENVIRONMENT = "local";
const SENTRY_DSN =
  "https://PMxJxuJckRJw1GxX7jTSgckw@eu-nbg-2.betterstackdata.com/1603661";
// SENTRY_ENVIRONMENT === "prod" || SENTRY_ENVIRONMENT === "test" || SENTRY_ENVIRONMENT === "local"
// ? "https://PMxJxuJckRJw1GxX7jTSgckw@eu-nbg-2.betterstackdata.com/1603661"
// : undefined;
const SENTRY_TRACE_SAMPLE_RATE = process.env.SENTRY_TRACE_SAMPLE_RATE ?? "0";

export function initSentryClient(appName: string) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    beforeSend(event) {
      event.tags = { ...event.tags, app: appName };
      return event;
    },
  });
}

export function initSentryServer(appName: string) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    beforeSend(event) {
      event.tags = { ...event.tags, app: appName };
      return event;
    },
  });
}

export function initSentryEdge(appName: string) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    beforeSend(event) {
      event.tags = { ...event.tags, app: appName };
      return event;
    },
  });
}
