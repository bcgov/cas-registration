/* eslint-disable */
import http from "k6/http";
import { Rate } from "k6/metrics";
import { check, fail } from "k6";
import {
  CAS_ADMIN_USER_GUID,
  CAS_ANALYST_USER_GUID,
  CAS_DIRECTOR_USER_GUID,
  INDUSTRY_USER_ADMIN_GUID,
  INDUSTRY_USER_NO_OPERATOR_GUID,
  INDUSTRY_USER_REPORTER_GUID,
} from "./constants.js";

const errorRate = new Rate("errors"); // Tracks request failures

const getUserParams = (role) => {
  const userGuidMap = {
    industry_user_reporter: INDUSTRY_USER_REPORTER_GUID,
    industry_user_admin: INDUSTRY_USER_ADMIN_GUID,
    industry_user_no_operator: INDUSTRY_USER_NO_OPERATOR_GUID,
    cas_admin: CAS_ADMIN_USER_GUID,
    cas_analyst: CAS_ANALYST_USER_GUID,
    cas_director: CAS_DIRECTOR_USER_GUID,
  };
  const userGuid = userGuidMap[role];
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({
        user_guid: userGuid,
      }),
    },
  };
};

// Helper function to handle common HTTP request logic
function makeRequest(
  method,
  url,
  payload,
  params,
  successStatusCode,
  errorMessage,
) {
  const res = http.request(method, url, payload, params);

  // This is just for debugging purposes
  if (![200, 201].includes(res.status))
    console.log(res.body, "-------------------------------------------");

  const success = check(res, {
    [`${errorMessage} - Status ${successStatusCode}`]: (r) =>
      r.status === successStatusCode,
  });

  errorRate.add(!success);
  if (!success) fail(errorMessage);

  return res;
}

export { makeRequest, getUserParams };
