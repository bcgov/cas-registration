/* eslint-disable */
import exec from "k6/execution";
import {
  facility,
  contact,
  operator,
  registration,
  administration,
  operation,
  user,
  userOperator,
} from "./scenarios/frontend/index.js";

const defaultOptions = {
  executor: "constant-vus",
  // Due to the heavy nature of the front end tests experiment with the number of VUs
  // and maybe try running one scenario at a time to avoid overloading your system and getting errors
  vus: 1, // If running all 8 scenarios this is 1x8=8 VUs
  duration: "600s", // 10 minutes
  options: {
    browser: {
      type: "chromium",
    },
  },
};

export const options = {
  scenarios: Object.fromEntries(
    [
      "operation",
      "user",
      "userOperator",
      "administration",
      "facility",
      "contact",
      "operator",
      "registration",
    ].map((name) => [name, defaultOptions]),
  ),
  thresholds: {
    checks: ["rate==1.0"],
    browser_http_req_duration: ["p(95) < 1000"],
    // Below are the thresholds for the Web Vitals according to the Google Web Vitals thresholds(https://web.dev/articles/vitals#core-web-vitals)
    browser_web_vital_fcp: ["p(95) < 1800"],
    browser_web_vital_lcp: ["p(95) < 2500"],
    browser_web_vital_cls: ["p(95) < 0.1"],
  },
};

export default function () {
  const scenarioFunctions = {
    administration,
    operation,
    user,
    userOperator,
    facility,
    contact,
    operator,
    registration,
  };
  const scenarioFunction = scenarioFunctions[exec.scenario.name];
  if (!scenarioFunction) {
    throw new Error(
      `No scenario function found for scenario ${exec.scenario.name}`,
    );
  }
  scenarioFunction();
}
