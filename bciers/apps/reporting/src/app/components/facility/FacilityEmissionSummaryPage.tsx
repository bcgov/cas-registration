import FacilityEmissionSummaryForm from "@reporting/src/app/components/facility/FacilityEmissionSummaryForm";
import { getFacilitiesInformationTaskList } from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";

import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getSummaryData } from "@reporting/src/app/utils/getSummaryData";

export default async function FacilityEmissionSummaryPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const summaryData = await getSummaryData(version_id, facility_id);
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const taskListData = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
  );

  const emissionSummaryTaskListElement = taskListData.find(
    (e) => e.title == "Emissions Summary",
  );
  if (emissionSummaryTaskListElement)
    emissionSummaryTaskListElement.isActive = true;

  const formData = {
    attributableForReporting: summaryData.attributable_for_reporting,
    attributableForReportingThreshold: summaryData.attributable_for_threshold,
    emissionCategories: {
      flaring: summaryData.flaring,
      fugitive: summaryData.fugitive,
      industrialProcess: summaryData.industrial_process,
      onSiteTransportation: summaryData.onsite,
      stationaryCombustion: summaryData.stationary,
      ventingUseful: summaryData.venting_useful,
      ventingNonUseful: summaryData.venting_non_useful,
      waste: summaryData.waste,
      wastewater: summaryData.wastewater,
    },
    fuelExcluded: {
      woodyBiomass: summaryData.woody_biomass,
      excludedBiomass: summaryData.excluded_biomass,
      excludedNonBiomass: summaryData.excluded_non_biomass,
    },
    otherExcluded: {
      lfoExcluded: summaryData.lfo_excluded,
    },
  };

  return (
    <FacilityEmissionSummaryForm
      versionId={version_id}
      facilityId={facility_id}
      summaryFormData={formData}
      taskListElements={taskListData}
    />
  );
}
