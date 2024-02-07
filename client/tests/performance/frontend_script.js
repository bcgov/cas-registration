/* eslint-disable */
import exec from "k6/execution";
import landing_page from "./scenarios/frontend/landing_page.js";
import operation from "./scenarios/frontend/operation.js";
import user from "./scenarios/frontend/user.js";
import user_operator from "./scenarios/frontend/user_operator.js";

const defaultOptions = {
  executor: "constant-vus",
  vus: 5,
  duration: "10000s",
  options: {
    browser: {
      type: "chromium",
    },
  },
};
export const options = {
  scenarios: {
    // landing_page: defaultOptions,
    operation: defaultOptions,
    // user: defaultOptions,
    // user_operator: defaultOptions,
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
