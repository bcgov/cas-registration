import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import ReviewFacilitiesForm from "./ReviewFacilitiesForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";

export default async function LFOFacilitiesPage({
  version_id,
}: HasReportVersion) {
  const initialData = await getOperationFacilitiesList(version_id);
  const navInfo = await getNavigationInformation(
    HeaderStep.OperationInformation,
    ReportingPage.ReviewFacilities,
    version_id,
    initialData.current_facilities[0]?.facility_id,
  );

  return (
    <>
      <ReviewFacilitiesForm
        version_id={version_id}
        initialData={initialData}
        navigationInformation={navInfo}
      />
    </>
  );
}
