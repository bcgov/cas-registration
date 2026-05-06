const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const VIEWPORT = "1366x768";
const MAXHEIGHT = 20000;
const CHUNKS = 4;

const allBrowsers = process.env.HAPPO_ALL_BROWSERS === "true";

const targetConfig = { viewport: VIEWPORT, maxHeight: MAXHEIGHT, chunks: CHUNKS };

const baseConfig = {
  integration: {
    type: "playwright",
    downloadAllAssets: true,
  },
  targets: {
    chrome: { type: "chrome", ...targetConfig },
    edge: { type: "edge", ...targetConfig },
    ...(allBrowsers && {
      firefox: { type: "firefox", ...targetConfig },
      safari: { type: "safari", ...targetConfig },
    }),
  },
};

module.exports = { baseConfig };
