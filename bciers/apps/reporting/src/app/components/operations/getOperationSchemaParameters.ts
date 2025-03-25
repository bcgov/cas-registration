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

export async function getOperationSchemaParameters(version_id: number) {
  const reportOperation = await getReportingOperation(version_id);
  const facilityReport = await getFacilityReport(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportingYear = await getReportingYear();

  const showRegulatedProducts = ![
    ELECTRICITY_IMPORT_OPERATION,
    REPORTING_OPERATION,
    POTENTIAL_REPORTING_OPERATION,
  ].includes(reportOperation.registration_purpose);

  const showBoroId = ![REPORTING_OPERATION].includes(
    reportOperation.registration_purpose,
  );

  return {
    reportOperation: reportOperation,
    facilityReport,
    allActivities,
    allRegulatedProducts,
    allRepresentatives: reportOperation.report_operation_representatives,
    reportType: reportOperation.operation_report_type,
    showRegulatedProducts,
    showBoroId,
    reportingWindowEnd: formatDate(
      reportingYear.reporting_window_end,
      "MMM DD YYYY",
    ),
  };
}
