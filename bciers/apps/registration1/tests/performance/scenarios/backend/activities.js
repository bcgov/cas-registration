/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { industryUserParams } from "../../setup/params";

const reportingActivities = () => {
  const HOST = __ENV.SERVER_HOST;
  // ##### GET #####

  check(http.get(HOST + "/reporting_activities", industryUserParams), {
    "is status 200": (r) => r.status === 200,
  });
};

export default reportingActivities;
