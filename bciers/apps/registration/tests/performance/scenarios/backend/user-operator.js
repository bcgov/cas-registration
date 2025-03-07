/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";
import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

// We need to have distinct users to be able to create operators and user operators
function createUser() {
  const url = "/users";
  const body = JSON.stringify({
    identity_provider: "bceidbusiness",
    first_name: "Test",
    last_name: "User",
    position_title: "Test Position",
    email: "test.user@test.com",
    phone_number: "+12345678901",
    business_guid: "12345678-1234-1234-1234-123456789012",
    bceid_business_name: "Test Business",
  });

  const newUserGuid = uuidv4();

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

const createOperatorAndUserOperator = (newUserGuid) => {
  const payload = JSON.stringify({
    legal_name: `Test Operator Legal Name ${randomString(5)}`, // to avoid duplicate legal names
    trade_name: "Test Operator Trade Name",
    business_structure: "Sole Proprietorship",
    cra_business_number: randomIntBetween(100000000, 999999999),
    bc_corporate_registry_number: `${randomString(3)}${randomIntBetween(
      1000000,
      9999999,
    )}`,
    partner_operators_array: [
      {
        partner_legal_name: "Partner Operator Legal Name",
        partner_trade_name: "Partner Operator Trade Name",
        partner_cra_business_number: 123456789,
        partner_bc_corporate_registry_number: `${randomString(
          3,
        )}${randomIntBetween(1000000, 9999999)}`,
        partner_business_structure: "Sole Proprietorship",
        partner_street_address: "123 Test St",
        partner_municipality: "TestVille",
        partner_province: "BC",
        partner_postal_code: "V1V 1V1",
      },
    ],
    mailing_address: 1,
    street_address: "123 Test St",
    municipality: "TestVille",
    province: "BC",
    postal_code: "V1V 1V1",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({ user_guid: newUserGuid }),
    },
  };

  const res = makeRequest(
    "POST",
    `${SERVER_HOST}/user-operators`,
    payload,
    params,
    201,
    "Operator and UserOperator creation failed",
  );
  return JSON.parse(res.body).user_operator_id;
};

const currentUsersOperatorHasRegisteredOperation = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/user-operators/current/has_registered_operation`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching registered operation failed",
  );
};

const currentUsersOperatorHasRequiredFields = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/user-operators/current/has-required-fields`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching required fields failed",
  );
};

const currentUserIsApprovedAdmin = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/user-operators/current/is-current-user-approved-admin`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching approved admin failed",
  );
};

const currentUsersOperatorDetails = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/user-operators/current/operator`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching operator details failed",
  );
};

const updateCurrentUsersOperatorDetails = () => {
  const payload = JSON.stringify({
    legal_name: "Updated Test Operator Legal Name",
    trade_name: "Updated Test Operator Trade Name",
    business_structure: "Sole Proprietorship",
    cra_business_number: randomIntBetween(100000000, 999999999),
    bc_corporate_registry_number: `${randomString(3)}${randomIntBetween(
      1000000,
      9999999,
    )}`,
    parent_operators_array: [
      {
        po_legal_name: "Updated Parent Operator Legal Name",
        po_trade_name: "Updated Parent Operator Trade Name",
        po_cra_business_number: 987654321,
        po_bc_corporate_registry_number: `${randomString(3)}${randomIntBetween(
          1000000,
          9999999,
        )}`,
        po_business_structure: "BC Corporation",
        po_street_address: "Updated 456 Test St",
        po_municipality: "Updated TestVille",
        po_province: "ON",
        po_postal_code: "V2V 2V2",
      },
    ],
    partner_operators_array: [
      {
        partner_legal_name: "Updated Partner Operator Legal Name",
        partner_trade_name: "Updated Partner Operator Trade Name",
        partner_cra_business_number: 123456789,
        partner_bc_corporate_registry_number: `${randomString(
          3,
        )}${randomIntBetween(1000000, 9999999)}`,
        partner_business_structure: "Sole Proprietorship",
        partner_street_address: "Updated 123 Test St",
        partner_municipality: "Updated TestVille",
        partner_province: "ON",
        partner_postal_code: "V2V 2V2",
      },
    ],
    mailing_address: 2,
    street_address: "Updated 123 Test St",
    municipality: "Updated TestVille",
    province: "ON",
    postal_code: "V2V 2V2",
  });

  makeRequest(
    "PUT",
    `${SERVER_HOST}/user-operators/current/operator`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Updating operator details failed",
  );
};

const updateUserOperatorStatus = (userOperatorId) => {
  const payload = JSON.stringify({
    role: "admin",
    status: "Approved",
  });

  makeRequest(
    "PATCH",
    `${SERVER_HOST}/user-operators/${userOperatorId}/status`,
    payload,
    getUserParams("cas_director"),
    200,
    "Updating user operator status failed",
  );
};

const fetchUserOperators = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/user-operators`,
    null,
    getUserParams("cas_admin"),
    200,
    "Fetching user operators failed",
  );
};

export default function () {
  const newUserGuid = createUser();
  const newUserOperatorId = createOperatorAndUserOperator(newUserGuid);
  currentUsersOperatorHasRegisteredOperation();
  currentUsersOperatorHasRequiredFields();
  currentUserIsApprovedAdmin();
  currentUsersOperatorDetails();
  updateCurrentUsersOperatorDetails();
  // updateUserOperatorStatus(newUserOperatorId);
  fetchUserOperators();
}
