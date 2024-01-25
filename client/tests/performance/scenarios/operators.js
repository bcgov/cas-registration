/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { industryUserParams, internalUserParams } from "../setup/params.js";

const operators = () => {
  const HOST = __ENV.SERVER_HOST;
  // ##### GET #####

  // operators?cra_business_number GET route
  check(
    http.get(
      HOST + "/operators?cra_business_number=123456789",
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  // operators/legal-name?search_value=Op GET route
  check(
    http.get(
      HOST + "/operators/legal-name?search_value=Op",
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  // operators/{operator_id} GET route
  check(http.get(HOST + "/operators/1", industryUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  // ##### PUT #####

  // operators/{operator_id} PUT route
  check(
    http.put(
      HOST + "/operators/1",
      JSON.stringify({
        id: 1,
        status: "Pending",
      }),
      internalUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
};

export default operators;
