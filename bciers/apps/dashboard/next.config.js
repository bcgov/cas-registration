//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

// The hosts are only available at build time. Routing locally is handled by Next.js while routing on OpenShift is handled by ingress rules.
const { HOST_REGISTRATION, HOST_REPORTING } = process.env;

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  async rewrites() {
    const localRoutes =
      HOST_REGISTRATION && HOST_REPORTING
        ? [
            {
              source: "/registration",
              destination: `${HOST_REGISTRATION}/registration`,
            },
            {
              source: "/registration/:path*",
              destination: `${HOST_REGISTRATION}/registration/:path*`,
            },
            {
              source: "/reporting",
              destination: `${HOST_REPORTING}/reporting`,
            },
            {
              source: "/reporting/:path*",
              destination: `${HOST_REPORTING}/reporting/:path*`,
            },
          ]
        : [];

    return [
      {
        source: "/:path*",
        destination: `/:path*`,
      },
      ...localRoutes,
    ];
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
