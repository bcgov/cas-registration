/* eslint-disable */
import exec from "k6/execution";
import landing_page from "./scenarios/frontend/landing_page.js";

const stages = [
  { duration: "5m", target: 20 }, // simulate ramp-up of traffic from 1 to 20 users over 5 minutes.
  { duration: "10m", target: 20 }, // stay at 20 users for 10 minutes
  { duration: "3m", target: 40 }, // ramp-up to 40 users over 3 minutes (peak hour starts)
  { duration: "2m", target: 40 }, // stay at 40 users for short amount of time (peak hour)
  { duration: "3m", target: 15 }, // ramp-down to 20 users over 3 minutes (peak hour ends)
  { duration: "10m", target: 15 }, // continue at 20 for additional 10 minutes
  { duration: "2m", target: 0 }, // ramp-down to 0 users
];

export const options = {
  scenarios: {
    landing_page: {
      executor: "constant-vus",
      vus: 20,
      duration: "10000s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
  thresholds: {
    checks: ["rate==1.0"],
  },
};

export default function () {
  if (exec.scenario.name === "landing_page") {
    landing_page();
  }
}
