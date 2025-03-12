/* eslint-disable */
import exec from "k6/execution";
import { facilities, facility, report } from "./scenarios/backend/index.js";

// Calculate the number of VUs by multiplying the number of users by the number of scenarios
// Example: 5 users and 5 scenarios result in 25 VUs
const stages = [
  // { duration: "2m", target: 10 }, // 80 VUs
  // { duration: "3m", target: 20 }, // 160 VUs
  // { duration: "3m", target: 30 }, // 240 VUs
  // { duration: "3m", target: 25 }, // 200 VUs
  // { duration: "3m", target: 15 }, // 120 VUs
  // { duration: "2m", target: 15 }, // 120 VUs
  // { duration: "2m", target: 0 }, // 0 VUs
  { duration: "10s", target: 2 }, // Ramp up to 2 VUs in 10s
  { duration: "10s", target: 4 }, // Ramp up to 4 VUs in 10s
  { duration: "10s", target: 6 }, // Ramp up to 6 VUs in 10s
  { duration: "10s", target: 3 }, // Ramp down to 3 VUs in 10s
  { duration: "10s", target: 1 }, // Ramp down to 1 VU in 10s
  { duration: "10s", target: 0 }, // Graceful shutdown to 0 VUs in 10s
];

export const options = {
  // abortOnFail: true, // Abort the test if a check fails
  // delayAbortEval: "20s", // Wait 20s before aborting the test - Gives the test time to generate some metrics before aborting
  scenarios: Object.fromEntries(
    ["report", "facility", "facilities"].map((name) => [
      name,
      {
        executor: "ramping-vus",
        stages: stages,
      },
    ]),
  ),
  thresholds: {
    // http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s // REG1 threshold
    "http_req_duration{status:200}": ["p(90)<500", "p(95)<800", "p(99)<1200"], // 90% of requests must complete below 500ms, 95% below 700ms, and 99% below 1s
    "http_req_duration{status:201}": ["p(90)<500", "p(95)<800", "p(99)<1200"], // 90% of requests must complete below 500ms, 95% below 700ms, and 99% below 1s
    errors: ["rate<0.05"], // Fail test if error rate exceeds 5%
  },
  rps: 50, // don't increase this without consulting platform services first
};

export default function () {
  const scenarioFunctions = {
    report,
    facility,
    facilities,
  };

  const scenarioFunction = scenarioFunctions[exec.scenario.name];
  if (!scenarioFunction)
    throw new Error(
      `No scenario function found for scenario ${exec.scenario.name}`,
    );
  else scenarioFunction();
}
