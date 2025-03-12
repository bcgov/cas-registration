import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegulatedProducts } from "@bciers/actions/api";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import OperationReviewForm from "./OperationReviewForm";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import {
  ELECTRICITY_IMPORT_OPERATION,
  POTENTIAL_REPORTING_OPERATION,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getFacilityReport } from "../../utils/getFacilityReport";

export default async function OperationReviewPage({
  version_id,
}: HasReportVersion) {
  const reportOperation = await getReportingOperation(version_id);
  const facilityReport = await getFacilityReport(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportingYear = await getReportingYear();
  const reportType = await getReportType(version_id);

  const allRepresentatives = reportOperation.report_operation_representatives;
  const showRegulatedProducts = ![
    ELECTRICITY_IMPORT_OPERATION,
    REPORTING_OPERATION,
    POTENTIAL_REPORTING_OPERATION,
  ].includes(reportOperation.registration_purpose);

  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );
  const schema = buildOperationReviewSchema(
    reportOperation,
    reportingWindowEnd,
    allActivities,
    allRegulatedProducts,
    allRepresentatives,
    reportType,
    showRegulatedProducts,
  );

  const navigationInformation = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.ReviewOperatorInfo,
    version_id,
    facilityReport.facility_id,
  );

  return (
    <OperationReviewForm
      formData={reportOperation}
      version_id={version_id}
      schema={schema}
      navigationInformation={navigationInformation}
    />
  );
}
