import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";

export default async function AdditionalReportingDataPage({
  versionId,
}: {
  versionId: number;
}) {
  const registrationPurpose = (await getRegistrationPurpose(versionId))
    ?.registration_purpose;
  const includeElectricityGenerated =
    registrationPurpose === "OBPS Regulated Operation";

  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={includeElectricityGenerated}
      />
    </Suspense>
  );
}
