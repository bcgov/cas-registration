/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const baseConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
  },
};

// Shared Sentry options for all apps
const defaultSentryWebpackOptions = {
  org: "government-of-british-columbia",
  project: "OBPS-next-js", // Shared project name
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
