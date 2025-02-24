/* eslint-disable */
import { SERVER_HOST, MOCK_DATA_URL } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";
import { createFacility } from "./facility.js";

function createOperation(operationType) {
  const payload = JSON.stringify({
    name: "Test Operation",
    type: "Single Facility Operation",
    registration_purpose: operationType,
    regulated_products: [1],
    activities: [1, 5],
    boundary_map: MOCK_DATA_URL,
    process_flow_diagram: MOCK_DATA_URL,
    naics_code_id: 1,
    secondary_naics_code_id: 2,
    tertiary_naics_code_id: 3,
    multiple_operators_array: [
      {
        mo_legal_name: "Multiple Operator Legal Name",
        mo_trade_name: "Multiple Operator Trade Name",
        mo_cra_business_number: 123456789,
        mo_bc_corporate_registry_number: "abc1234567",
        mo_business_structure: "Sole Proprietorship",
        mo_street_address: "123 Test St",
        mo_municipality: "TestVille",
        mo_province: "BC",
        mo_postal_code: "V1V 1V1",
      },
    ],
  });

  const res = makeRequest(
    "POST",
    `${SERVER_HOST}/operations`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Operation creation failed",
  );
  return JSON.parse(res.body).id;
}

function updateOperation(operationId) {
  const payload = JSON.stringify({
    name: "Test Operation Updated",
    type: "Single Facility Operation",
    registration_purpose: "Reporting Operation",
    regulated_products: [2],
    activities: [2, 6],
    boundary_map: MOCK_DATA_URL,
    process_flow_diagram: MOCK_DATA_URL,
    naics_code_id: 4,
    secondary_naics_code_id: 5,
    tertiary_naics_code_id: 6,
    multiple_operators_array: [
      {
        mo_legal_name: "Multiple Operator Legal Name Updated",
        mo_trade_name: "Multiple Operator Trade Name Updated",
        mo_cra_business_number: 987654321,
        mo_bc_corporate_registry_number: "def9876543",
        mo_business_structure: "Sole Proprietorship",
        mo_street_address: "123 Test St Updated",
        mo_municipality: "TestVille Updated",
        mo_province: "ON",
        mo_postal_code: "V2V 2V2",
      },
    ],
    operation_representatives: [1, 2, 3],
  });

  makeRequest(
    "PUT",
    `${SERVER_HOST}/operations/${operationId}`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Operation update failed",
  );
}

function addOperationRepresentative(operationId) {
  const payload = JSON.stringify({
    street_address: "123 Test St",
    municipality: "TestVille",
    province: "BC",
    postal_code: "V1V 1V1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@email.test",
    phone_number: "+16044015431",
    position_title: "Test Position",
  });

  makeRequest(
    "POST",
    `${SERVER_HOST}/operations/${operationId}/registration/operation-representative`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Adding operation representative failed",
  );
}

function fetchOperationDetails(operationId) {
  const endpoints = [
    `/operations/${operationId}/operation-representatives`,
    `/operations/${operationId}/with-documents`,
  ];

  endpoints.forEach((endpoint) => {
    makeRequest(
      "GET",
      `${SERVER_HOST}${endpoint}`,
      null,
      getUserParams("industry_user_admin"),
      200,
      `Fetching ${endpoint} failed`,
    );
  });
}

function assignIds(operationId) {
  const patchEndpoints = [
    `/operations/${operationId}/bcghg-id`,
    `/operations/${operationId}/boro-id`,
  ];

  patchEndpoints.forEach((endpoint) => {
    makeRequest(
      "PATCH",
      `${SERVER_HOST}${endpoint}`,
      "{}",
      getUserParams("cas_director"),
      200,
      `Assigning ID to ${endpoint} failed`,
    );
  });
}

function getNewEntrantApplication(operationId) {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operations/${operationId}/registration/new-entrant-application`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching new entrant application failed",
  );
}

function updateNewEntrantApplication(operationId) {
  const payload = JSON.stringify({
    new_entrant_application: MOCK_DATA_URL,
    date_of_first_shipment: "On or after April 1, 2024",
  });

  makeRequest(
    "PUT",
    `${SERVER_HOST}/operations/${operationId}/registration/new-entrant-application`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Updating new entrant application failed",
  );
}

function updateOptedInOperationDetail(operationId) {
  const payload = JSON.stringify({
    meets_section_3_emissions_requirements: true,
    meets_electricity_import_operation_criteria: true,
    meets_entire_operation_requirements: true,
    meets_section_6_emissions_requirements: true,
    meets_naics_code_11_22_562_classification_requirements: false,
    meets_producing_gger_schedule_a1_regulated_product: false,
    meets_reporting_and_regulated_obligations: false,
    meets_notification_to_director_on_criteria_change: false,
  });

  makeRequest(
    "PUT",
    `${SERVER_HOST}/operations/${operationId}/registration/opted-in-operation-detail`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Updating opted-in operation detail failed",
  );
}

function submitOperation(operationId) {
  const payload = JSON.stringify({
    acknowledgement_of_review: true,
    acknowledgement_of_records: true,
    acknowledgement_of_information: true,
  });

  makeRequest(
    "PATCH",
    `${SERVER_HOST}/operations/${operationId}/registration/submission`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Submitting operation failed",
  );
}

function fetchOperations() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operations`,
    null,
    getUserParams("cas_admin"),
    200,
    "Fetching operations failed",
  );
}

export default function () {
  const operationTypes = [
    "OBPS Regulated Operation",
    "Opted-in Operation",
    "New Entrant Operation",
  ];
  operationTypes.forEach((operationType) => {
    const operationId = createOperation(operationType);
    createFacility(operationId); // We have to create at least one facility to register an operation
    addOperationRepresentative(operationId);
    fetchOperationDetails(operationId);

    if (operationType === "Opted-in Operation") {
      updateOptedInOperationDetail(operationId);
    } else if (operationType === "New Entrant Operation") {
      updateNewEntrantApplication(operationId);
      getNewEntrantApplication(operationId);
    }
    submitOperation(operationId);
    assignIds(operationId); // This must happen after submitting the operation
    updateOperation(operationId); // This must happen as the last step because it changes the operation type
  });
  fetchOperations();
}
