import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { getBasicGasTypes } from "@reporting/src/app/utils/getAllGasTypes";
import { getAllEmissionCategories } from "@reporting/src/app/utils/getAllEmissionCategories";
import { getNonAttributableEmissionsData } from "@reporting/src/app/utils/getNonAttributableEmissionsData";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";

export default async function NonAttributableEmissionsPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const [
    gasTypes,
    emissionCategories,
    emissionFormData,
    tasklistData,
    orderedActivities,
  ] = await Promise.all([
    getBasicGasTypes(),
    getAllEmissionCategories(),
    getNonAttributableEmissionsData(version_id, facility_id),
    getReportInformationTasklist(version_id, facility_id),
    getOrderedActivities(version_id, facility_id),
  ]);

  const navigationInformation = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.NonAttributableEmission,
    version_id,
    facility_id,
    {
      facilityName: tasklistData?.facilityName,
      orderedActivities: orderedActivities,
    },
  );

  return (
    <NonAttributableEmissionsForm
      versionId={version_id}
      facilityId={facility_id}
      emissionFormData={emissionFormData}
      gasTypes={gasTypes}
      emissionCategories={emissionCategories}
      navigationInformation={navigationInformation}
    />
  );
}
