// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;
const SENTRY_DSN =
  SENTRY_ENVIRONMENT === "prod"
    ? "https://c097ce7d51760bab348fa0608eea9870@o646776.ingest.sentry.io/4506621387407360"
    : undefined;
const SENTRY_TRACE_SAMPLE_RATE = process.env.SENTRY_TRACE_SAMPLE_RATE ?? "0";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE),

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
