import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";

const REGULATED_OPERATION = "OBPS Regulated Operation";
const NEW_ENTRANT = "New Entrant Operation";
const CAPTURE_TYPES = {
  ON_SITE_USE: "On-site use",
  ON_SITE_SEQUESTRATION: "On-site sequestration",
  OFF_SITE_TRANSFER: "Off-site transfer",
};

const isValidValue = (value: any) => value !== null && value !== undefined;
interface AdditionalReportingDataProps {
  versionId: number;
}
const getCaptureTypeArray = (data: {
  emissions_on_site_use: number;
  emissions_on_site_sequestration: number;
  emissions_off_site_transfer: number;
}) => {
  const captureTypes = [];

  if (isValidValue(data.emissions_on_site_use)) {
    captureTypes.push(CAPTURE_TYPES.ON_SITE_USE);
  }

  if (isValidValue(data.emissions_on_site_sequestration)) {
    captureTypes.push(CAPTURE_TYPES.ON_SITE_SEQUESTRATION);
  }

  if (isValidValue(data.emissions_off_site_transfer)) {
    captureTypes.push(CAPTURE_TYPES.OFF_SITE_TRANSFER);
  }

  return captureTypes;
};

const transformToFormData = (
  data: {
    capture_emissions: boolean;
    emissions_on_site_use: number;
    emissions_on_site_sequestration: number;
    emissions_off_site_transfer: number;
    electricity_generated: number;
  },
  registrationPurpose: string,
) => ({
  captured_emissions_section: {
    capture_emissions: data.capture_emissions,
    capture_type: getCaptureTypeArray(data),
    emissions_on_site_use: data.emissions_on_site_use,
    emissions_on_site_sequestration: data.emissions_on_site_sequestration,
    emissions_off_site_transfer: data.emissions_off_site_transfer,
  },
  additional_data_section:
    registrationPurpose === REGULATED_OPERATION && data.electricity_generated
      ? { electricity_generated: data.electricity_generated }
      : undefined,
});

export default async function AdditionalReportingData({
  versionId,
}: AdditionalReportingDataProps) {
  const registrationPurpose = (await getRegistrationPurpose(versionId))
    ?.registration_purpose;
  const reportAdditionalData = await getReportAdditionalData(versionId);

  const initialFormData = reportAdditionalData
    ? transformToFormData(reportAdditionalData, registrationPurpose)
    : {
        captured_emissions_section: {
          capture_emissions: false,
          capture_type: [],
          emissions_on_site_use: 0,
          emissions_on_site_sequestration: 0,
          emissions_off_site_transfer: 0,
        },
        additional_data_section: {},
      };

  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={
          registrationPurpose === REGULATED_OPERATION
        }
        isNewEntrant={registrationPurpose === NEW_ENTRANT}
        initialFormData={initialFormData}
      />
    </Suspense>
  );
}
