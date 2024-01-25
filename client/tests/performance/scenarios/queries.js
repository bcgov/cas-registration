/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import exec from "k6/execution";

const queries = () => {
  const base_endpoint = "/api/registration";
  const endpoint =
    __ENV.APP_HOST + base_endpoint + "/operators/legal-name?search_value=Op";
  console.log("endpoint: ", endpoint);

  const params = {
    // cookies: {
    //   "mocks.auth_role": "industry_user",
    // },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.get(endpoint, params);

  check(res, {
    "is status 200": (r) => r.status === 200,
  });
};

export default queries;
