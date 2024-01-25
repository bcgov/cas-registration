/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { internalUserParams } from "../setup/params.js";

const operation = () => {
  const HOST = __ENV.SERVER_HOST;

  // ##### GET #####

  check(http.get(HOST + "/operations", internalUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  check(http.get(HOST + "/operations/1", internalUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  // ##### POST #####

  check(
    http.post(
      HOST + "/operations",
      JSON.stringify({
        id: 1,
        name: "Test Operation",
        operator_id: 1,
        status: "Pending",
      }),
      internalUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
};

export default operation;
