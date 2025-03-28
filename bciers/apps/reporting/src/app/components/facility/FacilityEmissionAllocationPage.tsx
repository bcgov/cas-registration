import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getOverlappingIndustrialProcessEmissions } from "../../utils/getOverlappingIndProcessEmissions";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const tasklistData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const initialData = await getEmissionAllocations(version_id, facility_id);

  // These values are used when reporting the pulp & paper activity
  let isPulpAndPaper = false;
  let overlappingIndustrialProcessEmissions = 0; // emissions that are categorized as both industrial_process and excluded (ie: woody biomass)
  if (
    orderedActivities.find(
      (activity: { id: Number; name: String; slug: String }) =>
        (activity.slug = "pulp_and_paper"),
    )
  ) {
    isPulpAndPaper = true;
    overlappingIndustrialProcessEmissions =
      await getOverlappingIndustrialProcessEmissions(version_id, facility_id);
  }

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.AllocationOfEmissions,
    version_id,
    facility_id,
    {
      orderedActivities: orderedActivities,
      facilityName: tasklistData?.facilityName,
    },
  );

  return (
    <FacilityEmissionAllocationForm
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={orderedActivities}
      initialData={initialData}
      navigationInformation={navInfo}
      isPulpAndPaper={isPulpAndPaper}
      overlappingIndustrialProcessEmissions={
        overlappingIndustrialProcessEmissions
      }
    />
  );
}
