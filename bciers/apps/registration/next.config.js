// Next.js doesn't use TS's paths, so we need to use the relative path
const { nextConfigBase, withSentry } = require("../../next.config.base");

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  ...nextConfigBase,
  // To deploy a Next.js application under a sub-path of a domain you can use the basePath config option
  basePath: "/registration",
  assetPrefix: "/registration/",
};

// Wrap the config in more Next.js plugins here if needed.
module.exports = withSentry(nextConfig);
