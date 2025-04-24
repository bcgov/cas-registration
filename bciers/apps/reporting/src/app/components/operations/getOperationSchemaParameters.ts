import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getRegulatedProducts } from "@bciers/actions/api";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import {
  ELECTRICITY_IMPORT_OPERATION,
  POTENTIAL_REPORTING_OPERATION,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

export const showRegulatedProducts = (registrationPurpose: string): boolean => {
  return ![
    ELECTRICITY_IMPORT_OPERATION,
    REPORTING_OPERATION,
    POTENTIAL_REPORTING_OPERATION,
  ].includes(registrationPurpose);
};

export const showBoroId = (registrationPurpose: string): boolean => {
  return ![REPORTING_OPERATION, ELECTRICITY_IMPORT_OPERATION].includes(
    registrationPurpose,
  );
};

export const showActivities = (registrationPurpose: string): boolean => {
  return ![
    ELECTRICITY_IMPORT_OPERATION,
    POTENTIAL_REPORTING_OPERATION,
  ].includes(registrationPurpose);
};

export async function getOperationSchemaParameters(version_id: number) {
  const reportOperation = await getReportingOperation(version_id);
  const facilityReport = await getFacilityReport(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportingYear = await getReportingYear();
  return {
    reportOperation: reportOperation,
    facilityReport,
    allActivities,
    allRegulatedProducts,
    allRepresentatives: reportOperation.report_operation_representatives,
    reportType: reportOperation.operation_report_type,
    showRegulatedProducts: showRegulatedProducts(
      reportOperation.registration_purpose,
    ),
    showBoroId: showBoroId(reportOperation.registration_purpose),
    showActivities: showActivities(reportOperation.registration_purpose),
    reportingWindowEnd: formatDate(
      reportingYear.reporting_window_end,
      "MMM DD YYYY",
    ),
  };
}
