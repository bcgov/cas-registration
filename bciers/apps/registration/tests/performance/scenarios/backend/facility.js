/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";
import { sleep } from "k6";

const mockOperationId = "556ceeb0-7e24-4d89-b639-61f625f82084";

export function createFacility(operationId) {
  const payload = JSON.stringify([
    {
      name: `Test Facility ${randomString(5)}`, // Avoid name conflicts
      type: "Large Facility",
      is_current_year: true,
      starting_date: "2024-04-04T09:00:00Z",
      street_address: "123 Test St",
      municipality: "Testville",
      province: "ON",
      postal_code: "A1A 1A1",
      operation_id: operationId || mockOperationId,
      well_authorization_numbers: [randomIntBetween(0, 1000000000)], // Randomize well auth number
      latitude_of_largest_emissions: 43.7,
      longitude_of_largest_emissions: -79.42,
    },
  ]);

  const res = makeRequest(
    "POST",
    `${SERVER_HOST}/facilities`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Facility creation failed",
  );
  return JSON.parse(res.body)[0].id;
}

function updateFacility(facilityId) {
  const payload = JSON.stringify({
    name: `Test Facility Updated ${Math.random()}`,
    type: "Single Facility",
    is_current_year: true,
    starting_date: "2025-05-05T09:00:00Z",
    street_address: "321 Test St",
    municipality: "Testville 2",
    province: "BC",
    postal_code: "H0H 0H0",
    operation_id: mockOperationId,
    latitude_of_largest_emissions: 33.7,
    longitude_of_largest_emissions: -89.42,
  });

  makeRequest(
    "PUT",
    `${SERVER_HOST}/facilities/${facilityId}`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Facility update failed",
  );
}

function assignBCGHGId(facilityId) {
  makeRequest(
    "PATCH",
    `${SERVER_HOST}/facilities/${facilityId}/bcghg-id`,
    "{}",
    getUserParams("cas_director"),
    200,
    "BC GHG ID assignment failed",
  );
}

function fetchFacilities() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operations/${mockOperationId}/facilities`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching facilities failed",
  );
}

export default function () {
  const facilityId = createFacility();
  updateFacility(facilityId);
  fetchFacilities();
  // sleep(1); // Mimic user behavior to avoid duplicate BC GHG ID error
  // assignBCGHGId(facilityId);
}
