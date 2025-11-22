import { defineConfig } from "happo";
import "dotenv/config";

const VIEWPORT = "1366x768";
const MAXHEIGHT = 20000;

export default defineConfig({
  apiKey: process.env.HAPPO_API_KEY!,
  apiSecret: process.env.HAPPO_API_SECRET!,
  project: "cas-registration",
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
});
