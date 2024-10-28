import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import AdditionalReportingData from "@reporting/src/app/components/additionalInformation/AdditionalReportingData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";

interface PageProps {
  params: { version_id: number };
}

export default async function Page({ params }: PageProps) {
  const versionId = params.version_id;
  const registrationPurposes =
    (await getRegistrationPurpose(versionId))?.registration_purposes || [];
  const includeElectricityGenerated = registrationPurposes.includes(
    "OBPS Regulated Operation",
  );

  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingData
        versionId={versionId}
        includeElectricityGenerated={includeElectricityGenerated}
      />
    </Suspense>
  );
}
