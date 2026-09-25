const { nextConfigBase, withSentry } = require("../../next.config.base");

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...nextConfigBase,
  basePath: "/registry",
  assetPrefix: "/registry/",
};

module.exports = withSentry(nextConfig);
