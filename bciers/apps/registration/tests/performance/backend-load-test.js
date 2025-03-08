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

// Calculate the number of VUs by multiplying the number of users by the number of scenarios
// Example: 5 users and 5 scenarios result in 25 VUs
const stages = [
  { duration: "2m", target: 10 }, // 80 VUs
  { duration: "3m", target: 20 }, // 160 VUs
  { duration: "3m", target: 30 }, // 240 VUs
  { duration: "3m", target: 25 }, // 200 VUs
  { duration: "3m", target: 15 }, // 120 VUs
  { duration: "2m", target: 15 }, // 120 VUs
  { duration: "2m", target: 0 }, // 0 VUs
];

export const options = {
  // abortOnFail: true, // Abort the test if a check fails
  // delayAbortEval: "20s", // Wait 20s before aborting the test - Gives the test time to generate some metrics before aborting
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
    // http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s // REG1 threshold
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
