/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";

const mockFacilityUUIDArray = [
  "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
  "459b80f9-b5f3-48aa-9727-90c30eaf3a58",
];
const facilityUUID1 = "f486f2fb-62ed-438d-bb3e-0819b51e3aeb";
const facilityUUID2 = "459b80f9-b5f3-48aa-9727-90c30eaf3a58";
const mockReportVersionId = 2;

const fetchFacilitiesList = (reportVersion) => {
  const reportVersionId = reportVersion || mockReportVersionId;
  makeRequest(
    "GET",
    `${SERVER_HOST}/report-version/${reportVersionId}/facility-list`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Facilities list retrieval failed",
  );
};

const fetchReviewFacilitiesList = (reportVersion) => {
  const reportVersionId = reportVersion || mockReportVersionId;
  makeRequest(
    "GET",
    `${SERVER_HOST}/report-version/${reportVersionId}/review-facilities`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Review Facilities retrieval failed",
  );
};

const fetchFacilityReportList = (reportVersion) => {
  const reportVersionId = reportVersion || mockReportVersionId;
  makeRequest(
    "GET",
    `${SERVER_HOST}/report-version/${reportVersionId}/facility-report-list`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Facility Report List retrieval failed",
  );
};
export function createFacilityReport(facilityIDArray, reportVersion) {
  const payload = JSON.stringify(facilityIDArray || mockFacilityUUIDArray);
  const reportVersionId = reportVersion || mockReportVersionId;
  makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${reportVersionId}/review-facilities`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Facility report create failed",
  );
}

export function updateFacilityReports(udatedFacilitiesList, reportVersion) {
  const payload = JSON.stringify(
    udatedFacilitiesList || [
      {
        facility: facilityUUID1,
        is_completed: true,
      },
      {
        facility: facilityUUID2,
        is_completed: false,
      },
    ],
  );
  const reportVersionId = reportVersion || mockReportVersionId;
  makeRequest(
    "PATCH",
    `${SERVER_HOST}/report-version/${reportVersionId}/facility-report-list`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    `Facility report update failed`,
  );
}
export default function () {
  fetchReviewFacilitiesList();
  createFacilityReport();
  fetchFacilityReportList();
  updateFacilityReports();
  fetchFacilitiesList();
}
