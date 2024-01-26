/* eslint-disable */
import exec from "k6/execution";
import business_structures from "./scenarios/business_structures.js";
import naics from "./scenarios/naics.js";
import operation from "./scenarios/operation.js";
import operator from "./scenarios/operator.js";
import regulated_products from "./scenarios/regulated_products.js";
import reporting_activities from "./scenarios/reporting_activities.js";
import user from "./scenarios/user.js";
import user_operator from "./scenarios/user_operator.js";

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
    operation: {
      executor: "ramping-vus",
      stages: stages,
    },
    operator: {
      executor: "ramping-vus",
      stages: stages,
    },
    user: {
      executor: "ramping-vus",
      stages: stages,
    },
    user_operator: {
      executor: "ramping-vus",
      stages: stages,
    },
    others: {
      // Grouping together the smaller GET endpoints
      executor: "ramping-vus",
      stages: stages,
    },
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
  if (exec.scenario.name === "operation") {
    operation();
  }

  if (exec.scenario.name === "operator") {
    operator();
  }

  if (exec.scenario.name === "user") {
    user();
  }

  if (exec.scenario.name === "user_operator") {
    user_operator();
  }

  if (exec.scenario.name === "others") {
    business_structures();
    naics();
    regulated_products();
    reporting_activities();
  }
}
