/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";
import { crypto } from "k6/experimental/webcrypto";

const operatorIdWithAdmin = "04384911-264a-4510-b582-11ee704b8e41";
const operatorIdWithNoAdmin = "7e8b72dc-4196-427f-a553-7879748139e1";

// We need to have distinct users to be able to be able to request access to operators
function createUser() {
  const url = "/users";
  const body = JSON.stringify({
    identity_provider: "bceidbusiness",
    first_name: "Test",
    last_name: "User",
    position_title: "Test Position",
    email: "test.user@test.com",
    phone_number: "+12345678901",
    business_guid: "04384911-264a-4510-b582-11ee704b8e41",
    bceid_business_name: "Test Business",
  });

  const newUserGuid = crypto.randomUUID();

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({ user_guid: newUserGuid }),
    },
  };

  makeRequest(
    "POST",
    `${SERVER_HOST}${url}`,
    body,
    params,
    201,
    "Creating User failed",
  );
  return newUserGuid;
}

const requestAccessToOperator = (userGuid) => {
  const payload = JSON.stringify({
    operator_id: operatorIdWithAdmin,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({ user_guid: userGuid }),
    },
  };

  makeRequest(
    "POST",
    `${SERVER_HOST}/operators/${operatorIdWithAdmin}/request-access`,
    payload,
    params,
    201,
    "Requesting access to operator failed",
  );
};

const requestAdminAccessToOperator = (userGuid) => {
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({ user_guid: userGuid }),
    },
  };

  makeRequest(
    "POST",
    `${SERVER_HOST}/operators/${operatorIdWithNoAdmin}/request-admin-access`,
    "{}",
    params,
    201,
    "Requesting admin access to operator failed",
  );
};

function fetchOperators() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operators`,
    null,
    getUserParams("cas_admin"),
    200,
    "Fetching operators failed",
  );
}

function searchOperatorsByLegalName() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operators/search?legal_name=a`,
    null,
    getUserParams("industry_user_no_operator"),
    200,
    "Searching operators by legal name failed",
  );
}

function searchOperatorsByBusinessNumber() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operators/search?cra_business_number=123456789`,
    null,
    getUserParams("industry_user_no_operator"),
    200,
    "Searching operators by business number failed",
  );
}

export default function () {
  const newUserGuid = createUser();
  requestAccessToOperator(newUserGuid);
  requestAdminAccessToOperator(newUserGuid);
  fetchOperators();
  searchOperatorsByLegalName();
  searchOperatorsByBusinessNumber();
}
