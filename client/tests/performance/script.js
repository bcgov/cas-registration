/* eslint-disable */
import exec from "k6/execution";
import business_structures from "./scenarios/business_structures.js";
import naics from "./scenarios/naics.js";
import operation from "./scenarios/operation.js";
import operator from "./scenarios/operator.js";

const stages = [
  { duration: "5m", target: 60 }, // simulate ramp-up of traffic from 1 to 60 users over 5 minutes.
  { duration: "10m", target: 60 }, // stay at 60 users for 10 minutes
  { duration: "3m", target: 100 }, // ramp-up to 100 users over 3 minutes (peak hour starts)
  { duration: "2m", target: 100 }, // stay at 100 users for short amount of time (peak hour)
  { duration: "3m", target: 60 }, // ramp-down to 60 users over 3 minutes (peak hour ends)
  { duration: "10m", target: 60 }, // continue at 60 for additional 10 minutes
  { duration: "2m", target: 0 }, // ramp-down to 0 users
];

export const options = {
  scenarios: {
    // business_structures: {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    // naics: {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    operation: {
      executor: "ramping-vus",
      stages: stages,
    },
    // operator: {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    // post: {
    //   startTime: "5m",
    //   executor: "shared-iterations",
    //   vus: 50, // 50 user looping for 1000 iterations
    //   iterations: 1000,
    // },
  },
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
  rps: 50, // don't increase this without consulting platform services first
};

export default function () {
  if (exec.scenario.name === "business_structures") {
    business_structures();
  }

  if (exec.scenario.name === "naics") {
    naics();
  }

  if (exec.scenario.name === "operation") {
    operation();
  }

  if (exec.scenario.name === "operator") {
    operator();
  }
}
