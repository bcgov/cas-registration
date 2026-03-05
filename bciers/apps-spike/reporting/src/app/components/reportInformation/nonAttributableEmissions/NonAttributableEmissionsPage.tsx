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
  const gasTypes = await getBasicGasTypes();
  const emissionCategories = await getAllEmissionCategories();
  const emissionFormData = await getNonAttributableEmissionsData(
    version_id,
    facility_id,
  );

  const tasklistData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

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

  const gasTypeMap = gasTypes.reduce(
    (
      acc: { [x: string]: any },
      gas: { id: string | number; chemical_formula: any },
    ) => {
      acc[gas.id] = gas.chemical_formula;
      return acc;
    },
    {} as Record<number, string>,
  );

  const emissionCategoryMap = emissionCategories.reduce(
    (
      acc: { [x: string]: any },
      category: { id: string | number; category_name: any },
    ) => {
      acc[category.id] = category.category_name;
      return acc;
    },
    {} as Record<number, string>,
  );

  return (
    <NonAttributableEmissionsForm
      versionId={version_id}
      facilityId={facility_id}
      emissionFormData={emissionFormData}
      gasTypes={gasTypes}
      emissionCategories={emissionCategories}
      gasTypeMap={gasTypeMap}
      emissionCategoryMap={emissionCategoryMap}
      navigationInformation={navigationInformation}
    />
  );
}
