/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const baseConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  serverActions: {
    bodySizeLimit: "25mb",
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
