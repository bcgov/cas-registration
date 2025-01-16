import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";

const REGULATED_OPERATION = "OBPS Regulated Operation";
const NEW_ENTRANT = "New Entrant Operation";

export function transformReportAdditionalData(reportAdditionalData: any) {
  const captureType = [];
  if (reportAdditionalData.emissions_on_site_use !== null) {
    captureType.push("On-site use");
  }
  if (reportAdditionalData.emissions_on_site_sequestration !== null) {
    captureType.push("On-site sequestration");
  }
  if (reportAdditionalData.emissions_off_site_transfer !== null) {
    captureType.push("Off-site transfer");
  }

  return {
    captured_emissions_section: {
      capture_type: captureType,
      capture_emissions: !!captureType.length,
      emissions_on_site_use: reportAdditionalData.emissions_on_site_use || null,
      emissions_on_site_sequestration:
        reportAdditionalData.emissions_on_site_sequestration || null,
      emissions_off_site_transfer:
        reportAdditionalData.emissions_off_site_transfer || null,
    },
    additional_data_section: {
      electricity_generated: reportAdditionalData.electricity_generated,
    },
  };
}

export default async function AdditionalReportingDataPage({
  version_id,
}: HasReportVersion) {
  const registrationPurpose = (await getRegistrationPurpose(version_id))
    ?.registration_purpose;
  const reportAdditionalData = await getReportAdditionalData(version_id);

  const transformedData = transformReportAdditionalData(reportAdditionalData);

  return (
    <AdditionalReportingDataForm
      versionId={version_id}
      includeElectricityGenerated={registrationPurpose === REGULATED_OPERATION}
      isNewEntrant={registrationPurpose === NEW_ENTRANT}
      initialFormData={transformedData}
    />
  );
}
