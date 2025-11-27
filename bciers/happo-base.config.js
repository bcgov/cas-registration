const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const VIEWPORT = "1366x768";
const MAXHEIGHT = 20000;

const baseConfig = {
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  integration: {
    type: "playwright",
  },
  targets: {
    chrome: {
      type: "chrome",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    },
    firefox: {
      type: "firefox",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    },
    safari: {
      type: "safari",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    },
    edge: {
      type: "edge",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
    },
  },
};

module.exports = { baseConfig };
