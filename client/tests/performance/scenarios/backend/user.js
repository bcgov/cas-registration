/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { crypto } from "k6/experimental/webcrypto";

import {
  industryUserParams,
  internalUserParams,
  INDUSTRY_USER_GUID,
} from "../../setup/params.js";

const user = () => {
  const HOST = __ENV.SERVER_HOST;
  // ##### GET #####

  check(http.get(HOST + "/user", industryUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  check(http.get(HOST + "/user/user-profile", industryUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  check(
    http.get(
      HOST + `/user/user-app-role/${INDUSTRY_USER_GUID}`,
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  // ##### POST #####

  check(
    http.post(
      HOST + `/user/user-profile/idir`,
      JSON.stringify({
        first_name: "Test",
        last_name: "User",
        position_title: "Test Position",
        email: "test.user@test.com",
        phone_number: "+12345678901",
        business_guid: "12345678-1234-1234-1234-123456789012",
        bceid_business_name: "Test Business",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.stringify({
            // Generate ranom UUID so we can create new users
            user_guid: crypto.randomUUID(),
          }),
        },
      },
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  // ##### PUT #####

  check(
    http.put(
      HOST + "/user/user-profile",
      JSON.stringify({
        first_name: "Updated First Name",
        last_name: "Updated Last Name",
        position_title: "Updated Position",
        email: "test.user@test.com",
        phone_number: "+12345678901",
        business_guid: "12345678-1234-1234-1234-123456789012",
        bceid_business_name: "Test Business",
      }),
      internalUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
};

export default user;
