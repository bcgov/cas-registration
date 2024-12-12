import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegulatedProducts } from "@bciers/actions/api";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import OperationReview from "./OperationReview";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  ActivePage,
  getOperationInformationTaskList,
} from "@reporting/src/app/components/taskList/1_operationInformation";

export default async function OperationReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const reportOperation = await getReportingOperation(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getRegulatedProducts();
  const reportingYear = await getReportingYear();
  const reportType = await getReportType(version_id);
  const registrationPurpose = await getRegistrationPurpose(version_id);
  const facilityReport = await getFacilityReport(version_id);
  const facilityPageUrl =
    facilityReport.operation_type === "Linear Facility Operation"
      ? `/reports/${version_id}/facilities/elfo-facilities`
      : `/reports/${version_id}/facilities/${facilityReport?.facility_id}/activities`;
  const registrationPurposeString = registrationPurpose?.registration_purpose;
  const taskListElements: TaskListElement[] = getOperationInformationTaskList(
    version_id,
    ActivePage.ReportOperationInformation,
    facilityPageUrl,
    facilityReport.operation_type,
  );

  return (
    <OperationReview
      formData={reportOperation}
      version_id={version_id}
      reportType={reportType}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
      registrationPurpose={registrationPurposeString}
      taskListElements={taskListElements}
    />
  );
}
