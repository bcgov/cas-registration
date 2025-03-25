/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";

const mockFacilityUUIDArray = [
  "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
  "459b80f9-b5f3-48aa-9727-90c30eaf3a58",
];

const mockReportVersionId = 2;
const mockActivityId = 1;

const getDefaultParams = (
  reportVersion = mockReportVersionId,
  facility = mockFacilityUUIDArray[0],
) => ({
  reportVersionId: reportVersion,
  facilityId: facility,
});

const fetchData = (url, reportVersion, facility, errorMessage) => {
  const { reportVersionId, facilityId } = getDefaultParams(
    reportVersion,
    facility,
  );
  makeRequest(
    "GET",
    `${SERVER_HOST}${url
      .replace(":reportVersionId", reportVersionId)
      .replace(":facilityId", facilityId)}`,
    null,
    getUserParams("industry_user_admin"),
    200,
    errorMessage,
  );
};

const postData = (
  url,
  payload,
  reportVersion,
  facility,
  errorMessage,
  successStatusCode = 200,
) => {
  const { reportVersionId, facilityId } = getDefaultParams(
    reportVersion,
    facility,
  );
  makeRequest(
    "POST",
    `${SERVER_HOST}${url
      .replace(":reportVersionId", reportVersionId)
      .replace(":facilityId", facilityId)}`,
    payload,
    getUserParams("industry_user_admin"),
    successStatusCode,
    errorMessage,
  );
};

const fetchAllocatedEmissions = (reportVersion, facility) => {
  const url =
    "/report-version/:reportVersionId/facilities/:facilityId/allocate-emissions";
  fetchData(
    url,
    reportVersion,
    facility,
    `Error fetching allocated emissions for facility`,
  );
};
const fetchActivitySchema = (reportVersion, facility) => {
  const url =
    // "/build-form-schema?activity=34&report_version_id=1&source_types[]=57&source_types[]=58&source_types[]=59&source_types[]=60&source_types[]=62&source_types[]=63&source_types[]=64&source_types[]=65&source_types[]=66&source_types[]=67&source_types[]=70&source_types[]=71&source_types[]=72&source_types[]=73&source_types[]=74&source_types[]=75&source_types[]=76&source_types[]=77&source_types[]=78&source_types[]=79&source_types[]=80&source_types[]=81&source_types[]=82&source_types[]=83&source_types[]=84&source_types[]=85";
    "/build-form-schema?activity=34&report_version_id=1&source_types[]=57&source_types[]=58&source_types[]=59&source_types[]=60&source_types[]=62&source_types[]=63&source_types[]=64&source_types[]=65&source_types[]=66&source_types[]=67";
  fetchData(
    url,
    reportVersion,
    facility,
    `Error fetching build schema for activity`,
  );
};

const fetchInitialActivityData = (reportVersion, facility, activityId = 1) => {
  const url = `/report-version/:reportVersionId/facility-report/:facilityId/initial-activity-data?activity_id=${activityId}`;
  fetchData(
    url,
    reportVersion,
    facility,
    `Error fetching Initial Activity data`,
  );
};

const fetchReportActivityData = (reportVersion, facility, activityId = 1) => {
  const url = `/report-version/:reportVersionId/facility-report/:facilityId/activity/${activityId}/report-activity`;
  fetchData(
    url,
    reportVersion,
    facility,
    `Error fetching Report Activity data`,
  );
};
const fetchEmissionSummary = (reportVersion, facility) => {
  const url =
    "/report-version/:reportVersionId/facility-report/:facilityId/emission-summary";
  fetchData(
    url,
    reportVersion,
    facility,
    `Error fetching emission summary for facility`,
  );
};

const createProductionData = (reportVersion, facility) => {
  const payload = JSON.stringify([
    {
      product_id: 1,
      product_name: "Cement equivalent",
      unit: "Tonne cement equivalent",
      annual_production: 45,
      production_data_apr_dec: 45,
      production_methodology: "OBPS Calculator",
      storage_quantity_start_of_period: 45,
      storage_quantity_end_of_period: 45,
      quantity_sold_during_period: 45,
      quantity_throughput_during_period: 45,
    },
  ]);
  const url =
    "/report-version/:reportVersionId/facilities/:facilityId/production-data";
  postData(
    url,
    payload,
    reportVersion,
    facility,
    `Error creating production data for facility`,
  );
};
const createActivityData = (reportVersion, facility) => {
  const reportVersionId = reportVersion || mockReportVersionId;
  const facilityId = facility || mockFacilityUUIDArray[0];
  const payload = JSON.stringify({
    activity_data: {
      id: 2,
      gscWithProductionOfUsefulEnergy: true,
      sourceTypes: {
        gscWithProductionOfUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  fuelType: {
                    fuelName: "Diesel",
                    fuelUnit: "kilolitres",
                    fuelClassification: "Non-biomass",
                  },
                  emissions: [
                    {
                      gasType: "CO2",
                      emission: 45,
                      equivalentEmission: "Value will be computed upon saving",
                      methodology: {
                        methodology: "Replacement Methodology",
                        description: "test description",
                      },
                    },
                  ],
                  fuelDescription: "test description",
                  annualFuelAmount: 45,
                },
              ],
              gscUnitName: "Test",
              gscUnitType: "Kiln",
            },
          ],
        },
      },
    },
  });
  const url =
    "/report-version/:reportVersionId/facilities/:facilityId/activity/1/report-activity";
  postData(
    url,
    payload,
    reportVersionId,
    facilityId,
    `Error creating activity data for facility`,
  );
};

const createNonAttributableEmissions = (reportVersion, facility) => {
  const payload = JSON.stringify({
    activities: [
      {
        gas_type: ["CO2", "CH4", "SF6", "CF4", "N2O", "C2F6"],
        activity: "test activity 1",
        source_type: "test source 1",
        emission_category: "Flaring emissions",
      },
      {
        gas_type: ["CO2", "CH4", "SF6", "CF4", "N2O", "C2F6"],
        activity: "test activity 2",
        source_type: "test source 2",
        emission_category: "Emissions from waste",
      },
    ],
    emissions_exceeded: true,
  });
  const url =
    "/report-version/:reportVersionId/facilities/:facilityId/non-attributable";
  postData(
    url,
    payload,
    reportVersion,
    facility,
    `Error creating non-attributable emissions for facility`,
    201,
  );
};
const saveFacilityReportData = (reportVersion, facility) => {
  const payload = JSON.stringify({
    facility_name: "Facility 1",
    facility_type: "Large Facility",
    facility_bcghgid: null,
    activities: ["1", "2", "31"],
    facility: facility,
  });
  const url = "/report-version/:reportVersionId/facility-report/:facilityId";
  postData(
    url,
    payload,
    reportVersion,
    facility,
    `Error saving review facility data`,
    201,
  );
};

const createAllocateEmissions = (reportVersion, facility) => {
  const payload = JSON.stringify({
    allocation_methodology: "Other",
    allocation_other_methodology_description: "Test methodology description",
    report_product_emission_allocations: [
      {
        emission_total: "0",
        emission_category_id: 1,
        products: [
          {
            report_product_id: 1,
            product_name: "Cement equivalent",
            allocated_quantity: 0,
          },
        ],
      },
      {
        emission_total: "100.0000",
        emission_category_id: 5,
        products: [
          {
            report_product_id: 1,
            product_name: "Cement equivalent",
            allocated_quantity: 100,
          },
        ],
      },
      {
        emission_total: "100.0000",
        emission_category_id: 12,
        products: [
          {
            report_product_id: 1,
            product_name: "Cement equivalent",
            allocated_quantity: 100,
          },
        ],
      },
    ],
  });
  const url =
    "/report-version/:reportVersionId/facilities/:facilityId/allocate-emissions";
  postData(
    url,
    payload,
    reportVersion,
    facility,
    `Error creating allocated emissions for facility`,
  );
};

export default function () {
  fetchAllocatedEmissions();
  fetchEmissionSummary();
  createProductionData();
  createAllocateEmissions();
  createNonAttributableEmissions();
  fetchInitialActivityData(
    mockReportVersionId,
    mockFacilityUUIDArray[0],
    mockActivityId,
  );
  fetchActivitySchema(mockReportVersionId, mockFacilityUUIDArray[0]);

  createActivityData();
  saveFacilityReportData(mockReportVersionId, mockFacilityUUIDArray[0]);
  // fetchReportActivityData(mockReportVersionId, mockFacilityUUIDArray[0], 1);
}
