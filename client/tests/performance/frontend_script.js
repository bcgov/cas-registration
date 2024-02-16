/* eslint-disable */
import exec from "k6/execution";
import landing_page from "./scenarios/frontend/landing_page.js";
import operation from "./scenarios/frontend/operation.js";
import user from "./scenarios/frontend/user.js";
import user_operator from "./scenarios/frontend/user_operator.js";

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
    landing_page: defaultOptions,
    operation: defaultOptions,
    user: defaultOptions,
    user_operator: defaultOptions,
  },
  thresholds: {
    checks: ["rate==1.0"],
  },
};

export default function () {
  if (exec.scenario.name === "landing_page") {
    landing_page();
  }

  if (exec.scenario.name === "operation") {
    operation();
  }

  if (exec.scenario.name === "user") {
    user();
  }

  if (exec.scenario.name === "user_operator") {
    user_operator();
  }
}
