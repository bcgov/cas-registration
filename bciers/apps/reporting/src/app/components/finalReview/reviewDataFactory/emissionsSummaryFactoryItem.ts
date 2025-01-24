import {
  facilityEmissionSummarySchema,
  facilityEmissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/facilityEmissionSummary";
import { ReviewDataFactoryItem } from "./factory";
import { getSummaryData } from "@reporting/src/app/utils/getSummaryData";

const emissionsSummaryFactoryItem: ReviewDataFactoryItem = async (
  versionId,
  facilityId,
) => {
  const summaryData = await getSummaryData(versionId, facilityId);

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

  return [
    {
      schema: facilityEmissionSummarySchema,
      data: formData,
      uiSchema: facilityEmissionSummaryUiSchema,
    },
  ];
};

export default emissionsSummaryFactoryItem;
