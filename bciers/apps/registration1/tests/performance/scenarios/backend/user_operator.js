/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import {
  industryUserParams,
  industryUser2Params,
  industryUser3Params,
  internalUserParams,
  INDUSTRY_USER_GUID,
} from "../../setup/params.js";
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
      HOST +
        `/user-operator/is-approved-admin-user-operator/${INDUSTRY_USER_GUID}`,
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  const getUserOperatorOperator = http.get(
    HOST + "/user-operators/user-operator",
    industryUser2Params,
  );

  check(getUserOperatorOperator, {
    "is status 200": (r) => r.status === 200,
  });

  check(getUserOperatorId, {
    "is status 200": (r) => r.status === 200,
  });

  const userOperatorId = JSON.parse(getUserOperatorId.body).user_operator_id;
  const operatorId = JSON.parse(getUserOperatorOperator.body).operator_id;

  check(
    http.get(HOST + `/user-operators/${userOperatorId}`, industryUserParams),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(
    http.get(HOST + `/operators/${operatorId}/has-admin/`, industryUserParams),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(
    http.get(
      HOST + "/user-operators/current/access-requests",
      industryUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(http.get(HOST + "/user-operators", internalUserParams), {
    "is status 200": (r) => r.status === 200,
  });

  // ##### POST #####

  check(
    http.post(
      HOST + "/operators/{operator_id}/request-admin-access",
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
  //     HOST + "/operators/{operator_id}/request-access",
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
      HOST + `/user/user-profile/bceidbusiness`,
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
            user_guid: newUserGuid,
          }),
        },
      },
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  const newUserParams = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({
        user_guid: newUserGuid,
      }),
    },
  };

  const userOperatorPayload = JSON.stringify({
    // Legal Name is unique now so generate a random one
    legal_name: crypto.randomUUID(),
    cra_business_number: Math.floor(Math.random() * 1000000000),
    // Business Registry Number is unique now so generate a random 8 digit number
    // Format: abc + 7 digits
    bc_corporate_registry_number: `abc${
      Math.floor(Math.random() * 90000) + 1000000
    }`,
    business_structure: "BC Corporation",
    physical_street_address: "123 Test Street",
    physical_municipality: "Victoria",
    physical_province: "BC",
    physical_postal_code: "V1V 1V1",
    mailing_address_same_as_physical: true,
    operator_has_parent_operators: false,
    user_operator_id: 1,
  });

  const createUserOperator = http.post(
    HOST + "/user-operators",
    userOperatorPayload,
    newUserParams,
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
      newUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
  // ##### PUT #####

  check(
    http.put(
      HOST + `/user-operators/${newUserOperatorId}`,
      userOperatorPayload,
      newUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );

  check(
    http.put(
      // brianna is this id ok
      HOST + `/user-operators/${newUserOperatorId}/update-status`,
      JSON.stringify({
        user_guid: newUserGuid,
        status: "Pending",
      }),
      internalUserParams,
    ),
    {
      "is status 200": (r) => r.status === 200,
    },
  );
};

export default userOperator;
