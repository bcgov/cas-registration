import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { REGULATED_OPERATION_REGISTRATION_PURPOSE } from "@reporting/src/app/utils/constants";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";

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
  const facilityReport = await getFacilityReport(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.AdditionalInformation,
    ReportingPage.AdditionalReportingData,
    version_id,
    facilityReport?.facility_id,
  );

  return (
    <AdditionalReportingDataForm
      versionId={version_id}
      includeElectricityGenerated={
        registrationPurpose === REGULATED_OPERATION_REGISTRATION_PURPOSE
      }
      initialFormData={transformedData}
      navigationInformation={navInfo}
    />
  );
}
