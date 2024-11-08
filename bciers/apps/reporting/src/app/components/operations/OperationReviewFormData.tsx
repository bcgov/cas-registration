import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegulatedProducts } from "@bciers/actions/api";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import OperationReview from "./OperationReview";
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

  const registrationPurposeString =
    registrationPurpose?.registration_purposes?.join(", ") || "";

  return (
    <OperationReview
      formData={reportOperation}
      version_id={version_id}
      reportType={reportType}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
      registrationPurpose={registrationPurposeString}
      facilityReport={facilityReport}
    />
  );
}
