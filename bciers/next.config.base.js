/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const path = require("node:path");

const baseConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: "standalone",
  turbopack: {
    // Set the root directory to the bciers folder to avoid parent lockfile confusion
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
    // Next.js 16.2.0 flipped experimental.reactDebugChannel to true by default
    // (vercel/next.js#90310). It streams REACT_DEBUG_CHUNK messages over the HMR
    // WebSocket as a blocking prerequisite to hydrateRoot. In our multi-zone dev
    // setup, pages are served through the dashboard proxy at localhost:3000, but
    // Next's HTTP rewrites cannot upgrade the HMR WebSocket to the zone's origin
    // (e.g. localhost:4001), so the debug chunks never arrive and client
    // components never hydrate — forms submit as native GET, useEffect never
    // runs, etc. Disabling the channel restores hydration without patching any
    // Next.js internals. This is a dev-only feature, so there is no production
    // impact. Revisit once multi-zone WebSocket proxying is addressed upstream.
    reactDebugChannel: false,
  },
  transpilePackages: ["mui-tel-input"],
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
  },
  async redirects() {
    return [
      {
        source: "/administration",
        destination: "/",
        permanent: true,
      },
      {
        source: "/compliance",
        destination: "/",
        permanent: true,
      },
      {
        source: "/compliance-administration",
        destination: "/compliance-administration/compliance-summaries",
        permanent: true,
      },
      {
        source: "/registration",
        destination: "/",
        permanent: true,
      },
      {
        source: "/reporting",
        destination: "/",
        permanent: true,
      },
      {
        source: "/reports",
        destination: "/reports/current-reports",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains;",
          },
        ],
      },
    ];
  },
};

// Shared Sentry options for all apps
const defaultSentryWebpackOptions = {
  org: "government-of-british-columbia",
  project: "obps-next-js", // Shared project name
  // Set to false to create a sentry release on build with the sentry CLI
  // This will upload sourcemaps to sentry.
  dryRun: true,
  silent: true, // Suppresses source map uploading logs during build
};

const defaultSentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
};

// Function to apply Sentry config with optional app-specific overrides
const withSentry = (config, sentryWebpackOptions = {}, sentryOptions = {}) => {
  return withSentryConfig(
    config,
    { ...defaultSentryWebpackOptions, ...sentryWebpackOptions },
    { ...defaultSentryOptions, ...sentryOptions },
  );
};

// Log and return the base config for debugging
const logAndReturnConfig = (config) => {
  return config;
};

module.exports = {
  nextConfigBase: logAndReturnConfig(baseConfig),
  withSentry,
};
