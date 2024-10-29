import React from "react";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import FacilityEmissionSummary from "./FacilityEmissionSummary";

interface Props {
  versionId: number;
  facilityId: UUID;
}

const getsummaryData = async (versionId: number, facilityId: UUID) => {
  return actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/emission-summary`,
    "GET",
    `reporting/report-version/${versionId}/facility-report/${facilityId}/emission-summary`,
  );
};

const FacilityEmissionSummaryData = async ({
  versionId,
  facilityId,
}: Props) => {
  const summaryData = await getsummaryData(versionId, facilityId);

  const formData = {
    attributableForReporting: summaryData.attributable_for_reporting,
    attributableForReportingThreshold: summaryData.attributable_for_threshold,
    reportingOnlyEmission: summaryData.reporting_only,
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
      fogExcluded: "0", // To be handled once we implement a way to capture FOG emissions
    },
  };

  return (
    <FacilityEmissionSummary
      versionId={versionId}
      facilityId={facilityId}
      summaryFormData={formData}
    />
  );
};

export default FacilityEmissionSummaryData;
