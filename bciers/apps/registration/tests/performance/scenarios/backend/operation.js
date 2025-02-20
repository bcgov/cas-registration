/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { industryUserParams, internalUserParams } from "../../setup/params.js";

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

  const operation = http.post(
    HOST + "/operations",
    JSON.stringify({
      operator_id: 2,
      name: "Test Operation",
      status: "Pending",
      documents: [],
      regulated_products: [],
      activities: [],
      type: "Test Type",
      naics_code: 21,
    }),
    industryUserParams,
  );

  check(operation, {
    "is status 201": (r) => r.status === 201,
  });

  // Get the operation id from the POST response so we can use it in PUT test
  const operationId = JSON.parse(operation.body).id;

  // ##### PUT #####

  check(
    http.put(
      HOST + `/operations/${operationId}?submit=false&form_section=1`,
      JSON.stringify({
        operator_id: 2,
        name: "Test Operation Updated",
        status: "Pending",
        documents: [],
        regulated_products: [],
        activities: [],
        type: "Test Type Updated",
        naics_code: 21,
      }),
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(
    http.put(
      HOST + `/operation/${operationId}/update-status`,
      JSON.stringify({
        status: "Approved",
      }),
      internalUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
};

export default operation;
