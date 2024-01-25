import http from "k6/http";
import { check } from "k6";

const queries = () => {
  const HOST = __ENV.SERVER_HOST;
  const INDUSTRY_USER_GUID = "279c80cf57814c28872740a133d17c0d";
  const INTERNAL_USER_GUID = "4da70f32-65fd-4137-87c1-111f2daba3dd";

  const industryUserParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({
        user_guid: INDUSTRY_USER_GUID,
      }),
    },
  };

  const internalUserParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({
        user_guid: INTERNAL_USER_GUID,
      }),
    },
  };

  // GET routes

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

  // PUT routes

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

export default queries;
