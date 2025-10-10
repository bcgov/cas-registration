const { composePlugins, withNx } = require("@nx/next");

// Next.js doesn't use TS's paths, so we need to use the relative path
const { nextConfigBase, withSentry } = require("../../next.config.base");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  ...nextConfigBase,
  // To deploy a Next.js application under a sub-path of a domain you can use the basePath config option
  basePath: "/reporting",
  assetPrefix: "/reporting/",
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withSentry, // Use shared Sentry config without overrides
];

module.exports = composePlugins(...plugins)(nextConfig);
