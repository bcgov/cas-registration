/** @type {import('next').NextConfig} */
const logAndReturnConfig = (config) => {
  return config;
};
module.exports = logAndReturnConfig({
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },

  //use modularizeImports properties to optimize the imports in the application
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
  },
});
