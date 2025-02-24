/* eslint-disable */
import exec from "k6/execution";
import {
  landingPage,
  operation,
  user,
  userOperator,
} from "./scenarios/frontend/index.js";

const defaultOptions = {
  executor: "constant-vus",
  // Due to the heavy nature of the front end tests experiment with the number of VUs
  // and maybe try running one scenario at a time to avoid overloading your system and getting errors
  vus: 1, // If running all 4 scenarios this is 1x4=4 VUs
  duration: "10000s",
  options: {
    browser: {
      type: "chromium",
    },
  },
};
export const options = {
  scenarios: {
    landingPage: defaultOptions,
    operation: defaultOptions,
    user: defaultOptions,
    userOperator: defaultOptions,
  },
  thresholds: {
    checks: ["rate==1.0"],
  },
};

export default function () {
  if (exec.scenario.name === "landing-page") {
    landingPage();
  }

  if (exec.scenario.name === "operation") {
    operation();
  }

  if (exec.scenario.name === "user") {
    user();
  }

  if (exec.scenario.name === "user-operator") {
    userOperator();
  }
}
