import http from "k6/http";
import { check } from "k6";

const queries = () => {
  const HOST = __ENV.SERVER_HOST;
  const INDUSTRY_USER_GUID = "279c80cf57814c28872740a133d17c0d";

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({
        user_guid: INDUSTRY_USER_GUID,
      }),
    },
  };

  // operators?cra_business_number GET route
  check(http.get(HOST + "/operators?cra_business_number=123456789", params), {
    "is status 200": (r) => r.status === 200,
  });

  // operators/legal-name?search_value=Op GET route
  check(http.get(HOST + "/operators/legal-name?search_value=Op", params), {
    "is status 200": (r) => r.status === 200,
  });

  // operators/{operator_id} GET route
  check(http.get(HOST + "/operators/1", params), {
    "is status 200": (r) => r.status === 200,
  });
};

export default queries;
