import OperationReview from "./OperationReview";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getAllRegulatedProducts } from "@reporting/src/app/utils/getAllRegulatedProducts";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";

export default async function OperationReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const reportOperation = await getReportingOperation(version_id);
  const allActivities = await getAllActivities();
  const allRegulatedProducts = await getAllRegulatedProducts();
  const reportingYear = await getReportingYear();
  const reportType = await getReportType(version_id);
  const registrationPurpose = await getRegistrationPurpose(version_id);

  const registrationPurposeString = Array.isArray(
    registrationPurpose.registration_purposes,
  )
    ? registrationPurpose.registration_purposes.join(", ")
    : registrationPurpose.registration_purposes || "";

  return (
    <OperationReview
      formData={reportOperation}
      version_id={version_id}
      reportType={reportType}
      allActivities={allActivities}
      reportingYear={reportingYear}
      allRegulatedProducts={allRegulatedProducts}
      registrationPurpose={registrationPurposeString}
    />
  );
}
