import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegulatedProducts } from "@bciers/actions/api";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import OperationReviewForm from "./OperationReviewForm";
import {
  ActivePage,
  getOperationInformationTaskList,
} from "@reporting/src/app/components/taskList/1_operationInformation";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import {
  ELECTRICITY_IMPORT_OPERATION,
  POTENTIAL_REPORTING_OPERATION,
  REPORTING_OPERATION,
} from "@reporting/src/app/utils/constants";

export default async function OperationReviewPage({
  version_id,
}: HasReportVersion) {
  const reportOperation = await getReportingOperation(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportingYear = await getReportingYear();
  const reportType = await getReportType(version_id);
  const registrationPurpose = await getRegistrationPurpose(version_id);
  const facilityReport = await getFacilityReport(version_id);

  const registrationPurposeString = registrationPurpose?.registration_purpose;

  const allRepresentatives = reportOperation.report_operation_representatives;
  const showRegulatedProducts = ![
    ELECTRICITY_IMPORT_OPERATION,
    REPORTING_OPERATION,
    POTENTIAL_REPORTING_OPERATION,
  ].includes(registrationPurposeString);
  const taskListElements = getOperationInformationTaskList(
    version_id,
    ActivePage.ReviewOperatorInfo,
    facilityReport.operation_type,
  );

  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );
  const schema = buildOperationReviewSchema(
    reportOperation,
    registrationPurposeString,
    reportingWindowEnd,
    allActivities,
    allRegulatedProducts,
    allRepresentatives,
    reportType,
    showRegulatedProducts,
  );

  return (
    <OperationReviewForm
      formData={reportOperation}
      version_id={version_id}
      schema={schema}
      taskListElements={taskListElements}
    />
  );
}
