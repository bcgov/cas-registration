import { getEmissionAllocationPageData } from "@reporting/src/app/utils/getEmissionAllocations";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const page_data = await getEmissionAllocationPageData(
    version_id,
    facility_id,
  );

  // These values are used when reporting the pulp & paper activity
  let isPulpAndPaper = false;
  let overlappingIndustrialProcessEmissions = 0; // emissions that are categorized as both industrial_process and excluded (ie: woody biomass)
  if (
    page_data.payload.ordered_activities.find(
      (activity: { id: number; name: string; slug: string }) =>
        (activity.slug = "pulp_and_paper"),
    )
  ) {
    isPulpAndPaper = true;
    overlappingIndustrialProcessEmissions =
      page_data.payload.overlapping_industrial_process_emissions;
  }

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.AllocationOfEmissions,
    version_id,
    facility_id,
    {
      orderedActivities: page_data.payload.ordered_activities,
      facilityName: page_data.facility_data.facility_name,
    },
  );

  return (
    <FacilityEmissionAllocationForm
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={page_data.payload.ordered_activities}
      initialData={page_data.payload.emission_allocation_data}
      navigationInformation={navInfo}
      isPulpAndPaper={isPulpAndPaper}
      overlappingIndustrialProcessEmissions={
        overlappingIndustrialProcessEmissions
      }
      facilityType={page_data.facility_data.facility_type}
      operationType={page_data.operation_data.operation_type}
    />
  );
}
