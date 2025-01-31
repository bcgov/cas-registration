const { composePlugins, withNx } = require("@nx/next");

// The hosts are only available at build time. Routing locally is handled by Next.js while routing on OpenShift is handled by ingress rules.
const {
  HOST_ADMINISTRATION,
  HOST_REGISTRATION,
  HOST_REPORTING,
  HOST_COMPLIANCE,
} = process.env;
// Next.js doesn't use TS's paths, so we need to use the relative path
const nextConfigBase = require("../../next.config.base");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  ...nextConfigBase,
  async rewrites() {
    const adminRoutes = HOST_ADMINISTRATION
      ? [
          {
            source: "/administration",
            destination: `${HOST_ADMINISTRATION}/administration`,
          },
          {
            source: "/administration/:path*",
            destination: `${HOST_ADMINISTRATION}/administration/:path*`,
          },
        ]
      : [];

    const registrationRoutes = HOST_REGISTRATION
      ? [
          {
            source: "/registration",
            destination: `${HOST_REGISTRATION}/registration`,
          },
          {
            source: "/registration/:path*",
            destination: `${HOST_REGISTRATION}/registration/:path*`,
          },
        ]
      : [];

    const reportingRoutes = HOST_REPORTING
      ? [
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

    const complianceRoutes = HOST_COMPLIANCE
      ? [
          {
            source: "/compliance",
            destination: `${HOST_COMPLIANCE}/compliance`,
          },
          {
            source: "/compliance/:path*",
            destination: `${HOST_COMPLIANCE}/compliance/:path*`,
          },
        ]
      : [];

    const localRoutes = {
      ...adminRoutes,
      ...registrationRoutes,
      ...reportingRoutes,
      ...complianceRoutes,
    };

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
