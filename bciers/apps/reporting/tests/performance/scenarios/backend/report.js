/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";
import { FormData } from "https://jslib.k6.io/formdata/0.0.2/index.js";
import http from "k6/http";
import { sleep } from "k6";

const pdfFile = open("./testFile.pdf");
const mockreportVersionId = 1;
const generateOperationIds = () => {
  const operationIds = [];
  for (let i = 0; i <= 999; i++) {
    // Ensure the operation ID ends with a 12-digit number padded correctly
    const id = String(i + 1).padStart(12, "0"); // Add 1 to start from 1, and pad to 12 digits
    operationIds.push(`00000000-0000-0000-0000-${id}`);
  }
  return operationIds;
};

const operationIds = generateOperationIds();

// Set to keep track of used operationIds
const usedOperationIds = new Set();

const generateOperationId = () => {
  if (usedOperationIds.size >= operationIds.length) {
    // All IDs have been used
    throw new Error("All operation IDs have been used");
  }

  let newId;
  do {
    // Randomly pick an unused operation ID
    const randomIndex = Math.floor(Math.random() * operationIds.length);
    newId = operationIds[randomIndex];
  } while (usedOperationIds.has(newId)); // Ensure the ID hasn't been used before

  usedOperationIds.add(newId); // Mark the ID as used
  return newId;
};

const createReport = (operationId) => {
  const operationID = operationId || generateOperationId();
  const payload = JSON.stringify({
    operation_id: operationID,
    reporting_year: 2024,
  });
  const res = makeRequest(
    "POST",
    `${SERVER_HOST}/create-report`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "report create failed",
  );
  return JSON.parse(res.body);
};
const changeReportType = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = JSON.stringify({
    report_type: "Annual Report",
  });
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/change-report-type`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Change report type failed",
  );
};
const createNewEntrantData = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = JSON.stringify({
    authorization_date: "2024-12-01T16:15:00.070Z",
    first_shipment_date: "2024-12-01T16:15:01.816Z",
    new_entrant_period_start: "2024-12-01T16:15:03.750Z",
    assertion_statement: true,
    products: [
      {
        id: 2,
        name: "Cement equivalent",
        unit: "Tonne cement equivalent",
        production_amount: 15,
      },
      {
        id: 6,
        name: "Gypsum wallboard",
        unit: "Thousand square feet",
        production_amount: 5,
      },
      {
        id: 7,
        name: "Lime at 94.5% CaO and lime kiln dust",
        unit: "Tonne lime@94.5% CAO + LKD",
        production_amount: 5,
      },
      {
        id: 8,
        name: "Limestone for sale",
        unit: "Tonne limestone",
        production_amount: 5,
      },
    ],
    emissions: [
      {
        title: "Emission categories after new entrant period began",
        emissionData: [
          { id: 1, name: "Flaring emissions", emission: 6 },
          { id: 2, name: "Fugitive emissions", emission: 5 },
          { id: 3, name: "Industrial process emissions", emission: 9 },
          { id: 4, name: "On-site transportation emissions", emission: 5 },
          { id: 5, name: "Stationary fuel combustion emissions", emission: 5 },
          { id: 6, name: "Venting emissions — useful", emission: 5 },
          { id: 7, name: "Venting emissions — non-useful", emission: 5 },
          { id: 8, name: "Emissions from waste", emission: 5 },
          { id: 9, name: "Emissions from wastewater", emission: 5 },
        ],
      },
      {
        title: "Emissions excluded by fuel type",
        emissionData: [
          {
            id: 10,
            name: "CO2 emissions from excluded woody biomass",
            emission: 5,
          },
          {
            id: 11,
            name: "Other emissions from excluded biomass",
            emission: 5,
          },
          { id: 12, name: "Emissions from excluded non-biomass", emission: 5 },
        ],
      },
      {
        title: "Other excluded emissions",
        emissionData: [
          {
            id: 13,
            name: "Emissions from line tracing and non-processing and non-compression activities",
            emission: 5,
          },
          {
            id: 14,
            name: "Emissions from fat, oil and grease collection, refining and storage",
            emission: 5,
          },
        ],
      },
    ],
  });
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/new-entrant-data`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "New Entrant create failed",
  );
};
const createReportAdditionalData = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = JSON.stringify({
    report_version: "1",
    capture_emissions: true,
    capture_type: ["On-site use", "On-site sequestration", "Off-site transfer"],
    emissions_on_site_use: 34,
    emissions_on_site_sequestration: 34,
    emissions_off_site_transfer: 34,
    electricity_generated: 45,
  });
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/additional-data`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Additional Data create failed",
  );
};

const createReportPersonResponsible = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = JSON.stringify({
    report_version: "1",
    street_address: "123 Main St",
    municipality: "City",
    province: "ON",
    postal_code: "A1B 2C3",
    id: 3,
    first_name: "Bill",
    last_name: "Blue",
    email: "bill.blue@example.com",
    phone_number: "+16044011235",
    position_title: "Manager",
    business_role: "Operation Representative",
  });
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/report-contact`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Person Responsible create failed",
  );
};
const createReportOperation = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = JSON.stringify({
    operator_legal_name: "Bravo Technologies - has parTNER operator",
    operator_trade_name: "Bravo Technologies",
    operation_name: "Bangles SFO - Registered - has Multiple Operators",
    registration_purpose: "OBPS Regulated Operation",
    operation_type: "Single Facility Operation",
    bc_obps_regulated_operation_id: "",
    operation_bcghgid: null,
    activities: [5, 1],
    regulated_products: [1, 2],
    report_operation_representatives: [
      {
        id: 41,
        representative_name: "Bill Blue",
        selected_for_report: true,
      },
    ],
    operation_representative_name: [41],
    operation_report_type: "Annual Report",
  });
  makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/report-operation`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Report operation create failed",
  );
};
const createReportVerification = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = JSON.stringify({
    verification_body_name: "Test",
    accredited_by: "SCC",
    scope_of_verification: "B.C. OBPS Annual Report",
    threats_to_independence: false,
    verification_conclusion: "Positive",
    report_verification_visits: [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ],
  });
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/report-verification`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Report Verification create failed",
  );
};
const createReportSubmit = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const payload = null;
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/submit`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    "Report submit failed",
  );
};

const createReportAttachment = (reportVersionId) => {
  const versionId = reportVersionId || mockreportVersionId;
  const formData = new FormData();

  const files = [
    {
      file: pdfFile,
      fileType: "verification_statement",
      filename: "verification_statement.pdf",
      content_type: "application/pdf",
    },
    {
      file: pdfFile,
      fileType: "wci_352_362",
      filename: "wci_352_362.pdf",
      content_type: "application/pdf",
    },
    {
      file: pdfFile,
      fileType: "additional_reportable_information",
      filename: "additional_reportable_information.pdf",
      content_type: "application/pdf",
    },
    {
      file: pdfFile,
      fileType: "confidentiality_request",
      filename: "confidentiality_request.pdf",
      content_type: "application/pdf",
    },
  ];

  files.forEach(({ file, fileType, filename, content_type }) => {
    // Create an object for each file and its type
    formData.append("files", http.file(file, filename, content_type));
    formData.append("file_types", fileType);
  });
  const industryUserParamHeaders = getUserParams("industry_user_admin");
  return makeRequest(
    "POST",
    `${SERVER_HOST}/report-version/${versionId}/attachments`,
    formData.body(),
    {
      ...industryUserParamHeaders,
      headers: {
        ...industryUserParamHeaders.headers,
        "Content-Type": "multipart/form-data; boundary=" + formData.boundary,
      },
    },

    200,
    "Report attachment failed",
  );
};

const fetchComplianceData = (reportVersion) => {
  const reportVersionId = reportVersion || mockreportVersionId;
  makeRequest(
    "GET",
    `${SERVER_HOST}/report-version/${reportVersionId}/compliance-data`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Compliance Data retrieval failed",
  );
};
const fetchOperations = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/operations`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Operations Data retrieval failed",
  );
};

export default async function () {
  const versionId = createReport();
  sleep(2);

  fetchOperations(versionId);
  createReportOperation(versionId);
  createReportPersonResponsible(versionId);
  createNewEntrantData(versionId);
  createReportAdditionalData(versionId);
  createReportVerification(versionId);
  createReportAttachment(versionId);
  fetchComplianceData(versionId);
  createReportSubmit(versionId);
}
