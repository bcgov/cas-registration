/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { industryUserParams } from "../../setup/params.js";

const others = () => {
  const HOST = __ENV.SERVER_HOST;
  const endpoints = [
    "/business_structures",
    "/naics_codes",
    "/regulated_products",
    "/reporting_activities",
  ];

  endpoints.forEach((endpoint) => {
    check(http.get(HOST + endpoint, industryUserParams), {
      "is status 200": (r) => r.status === 200,
    });
  });
};

export default others;
