/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const path = require("node:path");
const isLocal = process.env.ENVIRONMENT === "local";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${isLocal ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
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
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
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
