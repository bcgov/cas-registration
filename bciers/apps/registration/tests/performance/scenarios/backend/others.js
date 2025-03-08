/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";

function fetchBusinessStructures() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/business_structures`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching business structures failed",
  );
}

function fetchNaicsCodes() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/naics_codes`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching NAICS codes failed",
  );
}

function fetchRegulatedProducts() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/regulated_products`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching regulated products failed",
  );
}

function fetchReportingActivities() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/reporting_activities`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching reporting activities failed",
  );
}

export default function () {
  fetchBusinessStructures();
  fetchNaicsCodes();
  fetchRegulatedProducts();
  fetchReportingActivities();
}
