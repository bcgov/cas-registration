import React from "react";
import { actionHandler } from "@bciers/actions";
import OperationEmissionSummaryForm from "./OperationEmissionSummaryForm";
import { getAdditionalInformationTaskList } from "@reporting/src/app/components/taskList/3_additionalInformation";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";
import { NEW_ENTRANT_REGISTRATION_PURPOSE } from "@reporting/src/app/utils/constants";

interface Props {
  version_id: number; //name of the property from the pageFactory props
}

const getSummaryData = async (versionId: number) => {
  return actionHandler(
    `reporting/report-version/${versionId}/emission-summary`,
    "GET",
    `reporting/report-version/${versionId}/emission-summary`,
  );
};

const OperationEmissionSummaryPage = async ({ version_id }: Props) => {
  const versionId = version_id;
  const summaryData = await getSummaryData(versionId);
  const taskListData = getAdditionalInformationTaskList(versionId);

  const emissionSummaryTaskListElement = taskListData.find(
    (e) => e.title == "Operation emission summary",
  );
  if (emissionSummaryTaskListElement)
    emissionSummaryTaskListElement.isActive = true;

  const isNewEntrant =
    (await getReportAdditionalData(versionId))?.registration_purpose ===
    NEW_ENTRANT_REGISTRATION_PURPOSE;

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
    <OperationEmissionSummaryForm
      versionId={versionId}
      summaryFormData={formData}
      taskListElements={taskListData}
      isNewEntrant={isNewEntrant}
    />
  );
};

export default OperationEmissionSummaryPage;
