/* eslint-disable */
import exec from "k6/execution";
import queries from "./scenarios/queries.js";
import post from "./scenarios/post.js";

export const options = {
  scenarios: {
    get: {
      executor: "ramping-vus",
      stages: [
        { duration: "5m", target: 60 }, // simulate ramp-up of traffic from 1 to 60 users over 5 minutes.
        { duration: "10m", target: 60 }, // stay at 60 users for 10 minutes
        { duration: "3m", target: 100 }, // ramp-up to 100 users over 3 minutes (peak hour starts)
        { duration: "2m", target: 100 }, // stay at 100 users for short amount of time (peak hour)
        { duration: "3m", target: 60 }, // ramp-down to 60 users over 3 minutes (peak hour ends)
        { duration: "10m", target: 60 }, // continue at 60 for additional 10 minutes
        { duration: "2m", target: 0 }, // ramp-down to 0 users
      ],
    },
    post: {
      startTime: "35m",
      executor: "shared-iterations",
      vus: 50, // 50 user looping for 1000 iterations
      iterations: 1000,
    },
  },
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
  rps: 50, // don't increase this without consulting platform services first
};

export default function () {
  if (exec.scenario.name === "queries") {
    queries();
  }

  if (exec.scenario.name === "post") {
    post();
  }
}
