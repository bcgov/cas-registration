/** @type {import('next').NextConfig} */
const logAndReturnConfig = (config) => {
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
});
