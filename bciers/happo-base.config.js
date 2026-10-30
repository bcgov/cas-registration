const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const VIEWPORT = "1366x768";
const MAXHEIGHT = 20000;

const allBrowsers = process.env.HAPPO_ALL_BROWSERS === "true";

const targetConfig = {
  viewport: VIEWPORT,
  maxHeight: MAXHEIGHT,
  hideBehavior: "ignore",
};

const baseConfig = {
  // Keep per-project "Happo (<project>)" status checks; the develop ruleset requires them
  group: false,
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
