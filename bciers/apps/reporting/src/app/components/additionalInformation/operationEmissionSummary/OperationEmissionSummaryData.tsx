import React from "react";
import { actionHandler } from "@bciers/actions";
import OperationEmissionSummary from "./OperationEmissionSummary";
import { getAdditionalInformationTaskList } from "@reporting/src/app/components/taskList/3_additionalInformation";
interface Props {
  versionId: number;
}

const getsummaryData = async (versionId: number) => {
  return actionHandler(
    `reporting/report-version/${versionId}/emission-summary`,
    "GET",
    `reporting/report-version/${versionId}/emission-summary`,
  );
};

const OperationEmissionSummaryData = async ({ versionId }: Props) => {
  const summaryData = await getsummaryData(versionId);
  const taskListData = getAdditionalInformationTaskList(versionId);

  const emissionSummaryTaskListElement = taskListData.find(
    (e) => e.title == "Operation emission summary",
  );
  if (emissionSummaryTaskListElement)
    emissionSummaryTaskListElement.isActive = true;

  const formData = {
    attributableForReporting: summaryData.attributable_for_reporting ?? "0",
    attributableForReportingThreshold:
      summaryData.attributable_for_threshold ?? "0",
    reportingOnlyEmission: summaryData.reporting_only ?? "0",
    emissionCategories: {
      flaring: summaryData.flaring ?? "0",
      fugitive: summaryData.fugitive ?? "0",
      industrialProcess: summaryData.industrial_process ?? "0",
      onSiteTransportation: summaryData.onsite ?? "0",
      stationaryCombustion: summaryData.stationary ?? "0",
      ventingUseful: summaryData.venting_useful ?? "0",
      ventingNonUseful: summaryData.venting_non_useful ?? "0",
      waste: summaryData.waste ?? "0",
      wastewater: summaryData.wastewater ?? "0",
    },
    fuelExcluded: {
      woodyBiomass: summaryData.woody_biomass ?? "0",
      excludedBiomass: summaryData.excluded_biomass ?? "0",
      excludedNonBiomass: summaryData.excluded_non_biomass ?? "0",
    },
    otherExcluded: {
      lfoExcluded: summaryData.lfo_excluded ?? "0",
      fogExcluded: "0", // To be handled once we implement a way to capture FOG emissions
    },
  };

  return (
    <OperationEmissionSummary
      versionId={versionId}
      summaryFormData={formData}
      taskListElements={taskListData}
    />
  );
};

export default OperationEmissionSummaryData;
