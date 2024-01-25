/* eslint-disable */
import http from "k6/http";
import { check } from "k6";

const mutations = () => {
  const base_endpoint = "/api/registration/";

  const postParams = {
    cookies: {
      "mocks.auth_role": "industry_user",
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const payload = JSON.stringify({
    id: 1,
  });

  const res = http.post(
    __ENV.APP_HOST + base_endpoint + "ROUTE HERE",
    payload,
    Object.assign({}, postParams, {
      tags: { name: "TAG NAME HERE" },
    }),
  );

  check(res, {
    "is status 200": (r) => r.status === 200,
  });
};

export default mutations;
