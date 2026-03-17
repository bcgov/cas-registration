import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";
import { transformNewEntrantFormData } from "@reporting/src/app/components/additionalInformation/newEntrantInformation/transformNewEntrantFormData";

export default async function NewEntrantInformationPage({
  version_id,
}: HasReportVersion) {
  const formData = await transformNewEntrantFormData(version_id);

  const facilityReport = await getFacilityReport(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.AdditionalInformation,
    ReportingPage.NewEntrantInformation,
    version_id,
    facilityReport?.facility_id,
  );

  return (
    <NewEntrantInformationForm
      version_id={version_id}
      initialFormData={formData}
      navigationInformation={navInfo}
    />
  );
}
