/* eslint-disable */
import exec from "k6/execution";
import {
  operation,
  operator,
  user,
  userOperator,
  transferEvent,
  others,
  facility,
  contact,
} from "./scenarios/backend/index.js";

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
  abortOnFail: true,
  delayAbortEval: "20s",
  scenarios: Object.fromEntries(
    [
      "operation",
      "operator",
      "user",
      "user-operator",
      "others",
      "transfer-event",
      "facility",
      "contact",
    ].map((name) => [
      name,
      {
        executor: "ramping-vus",
        stages: stages,
      },
    ]),
  ),
  thresholds: {
    "http_req_duration{status:200}": ["p(90)<500", "p(95)<700", "p(99)<1000"], // 90% of requests must complete below 500ms, 95% below 700ms, and 99% below 1s
    "http_req_duration{status:201}": ["p(90)<500", "p(95)<800", "p(99)<1200"], // 90% of requests must complete below 500ms, 95% below 700ms, and 99% below 1s
    errors: ["rate<0.05"], // Fail test if error rate exceeds 5%
  },
  rps: 50, // don't increase this without consulting platform services first
};

export default function () {
  const scenarioFunctions = {
    others,
    user,
    "user-operator": userOperator,
    operator,
    operation,
    facility,
    contact,
    "transfer-event": transferEvent,
  };

  const scenarioFunction = scenarioFunctions[exec.scenario.name];
  if (!scenarioFunction)
    throw new Error(
      `No scenario function found for scenario ${exec.scenario.name}`,
    );
  else scenarioFunction();
}
