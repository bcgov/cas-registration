/** @type {import('next').NextConfig} */
const BODY_SIZE = "25mb";

const logAndReturnConfig = (config) => {
  console.log("Next.js base config is being loaded");
  console.log("BODY_SIZE", BODY_SIZE);
  console.log("config", config);
  return config;
};
module.exports = logAndReturnConfig({
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",

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
      bodySizeLimit: BODY_SIZE,
    },
  },
  // serverActions: {
  //   bodySizeLimit: BODY_SIZE,
  // },
  publicRuntimeConfig: {
    publicRuntimeSize: BODY_SIZE,
  },
  serverRuntimeConfig: {
    serverRuntimeSize: BODY_SIZE,
  },
});
