import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";

const REGULATED_OPERATION = "OBPS Regulated Operation";
const NEW_ENTRANT = "New Entrant Operation";

interface AdditionalReportingDataProps {
  versionId: number;
}

export default async function AdditionalReportingData({
  versionId,
}: AdditionalReportingDataProps) {
  const registrationPurpose = (await getRegistrationPurpose(versionId))
    ?.registration_purpose;
  const reportAdditionalData = await getReportAdditionalData(versionId);

  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={
          registrationPurpose === REGULATED_OPERATION
        }
        isNewEntrant={registrationPurpose === NEW_ENTRANT}
        initialFormData={reportAdditionalData}
      />
    </Suspense>
  );
}
