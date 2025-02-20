/* eslint-disable */
import exec from "k6/execution";
import { operation, operator, user, userOperator, transferEvent, others } from "./scenarios/backend/index.js";

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
    // operation: {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    // operator: {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    // user: {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    // "user-operator": {
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    // others: {
    //   // Grouping together the smaller GET endpoints
    //   executor: "ramping-vus",
    //   stages: stages,
    // },
    "transfer-event": {
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
    // http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
    "http_req_duration{status:200}": ["p(90)<500", "p(95)<700", "p(99)<1000"], // 90% of requests must complete below 500ms, 95% below 700ms, and 99% below 1s
  },
  rps: 50, // don't increase this without consulting platform services first
};


export default function () {
  const scenarioFunctions = {
    operation,
    operator,
    user,
    "user-operator": userOperator,
    "transfer-event": transferEvent,
    others,
  };

  const scenarioFunction = scenarioFunctions[exec.scenario.name];
  if (!scenarioFunction) throw new Error(`No scenario function found for scenario ${exec.scenario.name}`);
  else scenarioFunction();
}
