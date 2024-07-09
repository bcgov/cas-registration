/** @type {import('next').NextConfig} */
const { composePlugins, withNx } = require("@nx/next");

const nextConfigBase = require("../../next.config.base");

const nextConfig = {
  ...nextConfigBase,
  basePath:
    "https://cas-bciers-frontend-dev.apps.silver.devops.gov.bc.ca/registration",
  assetPrefix:
    "https://cas-bciers-frontend-dev.apps.silver.devops.gov.bc.ca/registration/",
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
  output: "standalone",
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
