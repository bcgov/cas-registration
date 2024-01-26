/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import {
  industryUserParams,
  industryUser2Params,
  industryUser3Params,
  internalUserParams,
  INDUSTRY_USER_GUID,
  INDUSTRY_USER_2_GUID,
  INDUSTRY_USER_3_GUID,
} from "../setup/params.js";
import { crypto } from "k6/experimental/webcrypto";

const userOperator = () => {
  const HOST = __ENV.SERVER_HOST;
  // ##### GET #####

  check(
    http.get(HOST + "/user-operator-status-from-user", industryUserParams),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(
    http.get(
      HOST + `/is-approved-admin-user-operator/${INDUSTRY_USER_GUID}`,
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  const getUserOperatorOperatorId = http.get(
    HOST + "/user-operator-operator-id",
    industryUser2Params,
  );

  check(getUserOperatorOperatorId, {
    "is status 200": (r) => r.status === 200,
  });

  const getUserOperatorId = http.get(
    HOST + "/user-operator-id",
    industryUserParams,
  );

  check(getUserOperatorId, {
    "is status 200": (r) => r.status === 200,
  });

  const userOperatorId = JSON.parse(getUserOperatorId.body).user_operator_id;
  const operatorId = JSON.parse(getUserOperatorOperatorId.body).operator_id;

  check(
    http.get(
      HOST + `/select-operator/user-operator/${userOperatorId}`,
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(
    http.get(HOST + `/operator-has-admin/${operatorId}`, industryUserParams),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(http.get(HOST + "/user-operator-list-from-user", industryUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  check(http.get(HOST + "/user-operators", internalUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  // ##### POST #####

  check(
    http.post(
      HOST + "/select-operator/request-admin-access",
      JSON.stringify({
        operator_id: 1,
      }),
      industryUser3Params,
    ),
    {
      "is status 201": (r) => r.status === 201,
    },
  );

  // need to return to this one and get it to POST correctly
  //   // check(
  //   http.post(
  //     HOST + "/select-operator/request-access",
  //     JSON.stringify({
  //       operator_id: operatorId,
  //     }),
  //     industryUserParams,
  //   ),
  //   {
  //     "is status 201": (r) => r.status === 201,
  //   },
  // );

  // Create a new user so we can test some POST routes that only allow one request per user
  const newUserGuid = crypto.randomUUID();

  check(
    http.post(
      HOST + `/user-profile/bceidbusiness`,
      JSON.stringify({
        first_name: "Test",
        last_name: "User",
        position_title: "Test Position",
        email: "test.user@idir",
        phone_number: "+1234567890",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.stringify({
            // Generate ranom UUID so we can create new users
            user_guid: newUserGuid,
          }),
        },
      },
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  const createUserOperator = http.post(
    HOST + "/user-operator/operator",
    JSON.stringify({
      legal_name: "Test Operator",
      cra_business_number: Math.floor(Math.random() * 1000000000),
      bc_corporate_registry_number: "adc1234321",
      business_structure: "BC Corporation",
      physical_street_address: "123 Test Street",
      physical_municipality: "Victoria",
      physical_province: "BC",
      physical_postal_code: "V1V 1V1",
      mailing_address_same_as_physical: true,
      operator_has_parent_operators: false,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: JSON.stringify({
          // Use the new user guid to create a new user operator so we can repeat the test
          user_guid: newUserGuid,
        }),
      },
    },
  );

  check(createUserOperator, {
    "is status 200": (r) => r.status === 200,
  });

  const newUserOperatorId = JSON.parse(
    createUserOperator.body,
  ).user_operator_id;

  check(
    http.post(
      HOST + "/user-operator/contact",
      JSON.stringify({
        user_operator_id: newUserOperatorId,
        is_senior_officer: true,
        street_address: "123 Test Street",
        municipality: "Victoria",
        province: "BC",
        first_name: "Test",
        last_name: "User",
        so_email: "test@test.ca",
        position_title: "Test Position",
        postal_code: "V1V 1V1",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.stringify({
            // Use the new user guid to create a new user operator so we can repeat the test
            user_guid: newUserGuid,
          }),
        },
      },
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
};

export default userOperator;
