import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import ElectricityInformationForm from "@reporting/src/app/components/eio/ElectricityInformationForm";

export default async function ElectricityInformationPage({
  version_id,
}: HasReportVersion) {
  const formData: never[] = []; //TO await(...)

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.ElectricityImportData,
    version_id,
    "",
    {
      isElectricityImport: true,
    },
  );
  return (
    <ElectricityInformationForm
      versionId={version_id}
      initialFormData={formData}
      navigationInformation={navInfo}
    />
  );
}
