const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const VIEWPORT = "1366x768";
const MAXHEIGHT = 20000;
const CHUNKS = 4;

const baseConfig = {
  integration: {
    type: "playwright",
    downloadAllAssets: true,
  },
  targets: {
    chrome: {
      type: "chrome",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
      chunks: CHUNKS,
    },
    firefox: {
      type: "firefox",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
      chunks: CHUNKS,
    },
    safari: {
      type: "safari",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
      chunks: CHUNKS,
    },
    edge: {
      type: "edge",
      viewport: VIEWPORT,
      maxHeight: MAXHEIGHT,
      chunks: CHUNKS,
    },
  },
};

module.exports = { baseConfig };
