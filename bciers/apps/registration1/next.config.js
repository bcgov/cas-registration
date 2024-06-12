/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const { composePlugins } = require("@nx/next");

const nextConfigBase = require("../../next.config.base");

const nextConfig = {
  ...nextConfigBase,
  reactStrictMode: true,
  swcMinify: true,
  //use modularizeImports properties to optimize the imports in the application
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

const sentryWebpackOptions = {
  org: "government-of-british-columbia",
  project: "registration-next-js",
  // Set to false to create a sentry release on build with the sentry CLI
  // This will upload sourcemaps to sentry.
  dryRun: true,
  silent: true, // Suppresses source map uploading logs during build
};

const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
};

const withSentry = (/** @type {import('next').NextConfig} */ config) =>
  withSentryConfig(config, sentryWebpackOptions, sentryOptions);

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withSentry,
];

module.exports = composePlugins(...plugins)(nextConfig);
