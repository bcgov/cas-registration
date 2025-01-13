import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegulatedProducts } from "@bciers/actions/api";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import OperationReviewForm from "@reporting/src/app/components/operations/OperationReviewForm";
import { HasReportVersion } from "@reporting/src/app/utils//defaultPageFactoryTypes";

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
  const transformedOperation = {
    ...reportOperation.report_operation,
    operation_representative_name:
      reportOperation.report_operation_representative,
  };
  console.log("transformedOperation", transformedOperation);
  const allRepresentatives = reportOperation.report_operation_representative;

  return (
    <OperationReviewForm
      formData={transformedOperation}
      version_id={version_id}
      reportType={reportType}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
      registrationPurpose={registrationPurposeString}
      facilityReport={facilityReport}
      allRepresentatives={allRepresentatives}
    />
  );
}
