//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

// The hosts are only available at build time. Routing locally is handled by Next.js while routing on OpenShift is handled by ingress rules.
// Next.js doesn't use TS's paths, so we need to use the relative path
const nextConfigBase = require("../../next.config.base");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  ...nextConfigBase,
  async rewrites() {
    const localRoutes = [
      {
        source: "/administration",
        destination: `http://localhost:4001/administration`,
      },
      {
        source: "/administration/:path*",
        destination: `http://localhost:4001/administration/:path*`,
      },
      {
        source: "/registration",
        destination: `http://localhost:4000/registration`,
      },
      {
        source: "/registration/:path*",
        destination: `http://localhost:4000/registration/:path*`,
      },
      {
        source: "/reporting",
        destination: `http://localhost:5000/reporting`,
      },
      {
        source: "/reporting/:path*",
        destination: `http://localhost:5000/reporting/:path*`,
      },
      {
        source: "/coam",
        destination: `http://localhost:7000/coam`,
      },
      {
        source: "/coam/:path*",
        destination: `http://localhost:7000/coam/:path*`,
      },
    ];

    return [
      {
        source: "/:path*",
        destination: `/:path*`,
      },
      ...localRoutes,
    ];
  },
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
