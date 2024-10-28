import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";

export default async function AdditionalReportingData({
  versionId,
}: {
  versionId: number;
}) {
  const registrationPurposes =
    (await getRegistrationPurpose(versionId))?.registration_purposes || [];
  const includeElectricityGenerated = registrationPurposes.includes(
    "OBPS Regulated Operation",
  );

  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={includeElectricityGenerated}
      />
    </Suspense>
  );
}
