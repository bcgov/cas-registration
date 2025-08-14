import activityFactoryItem from "./activityFactoryItem";
import nonAttributableEmissionsFactoryItem from "./nonAttributableEmissionsFactoryItem";
import emissionsSummaryFactoryItem from "./emissionsSummaryFactoryItem";
import productionDataFactoryItem from "./productionDataFactoryItem";
import allocationOfEmissionsFactoryItem from "./allocationOfEmissionsFactoryItem";
import { ReviewData } from "./factory";
import {
  ReportingPage,
  HeaderStep,
} from "@reporting/src/app/components/taskList/types";
import { ReportingFlowDescription } from "@reporting/src/app/components/taskList/types";

export default async function facilityActivitiesFactoryItem(
  versionId: number,
  facilities: {
    facility_id: string;
    facility__name: string;
    is_selected: boolean;
  }[],
  flow: ReportingFlowDescription, // Now pass the entire flow
): Promise<ReviewData[]> {
  const reviewData: ReviewData[] = [];

  // Derive the pages to process from the provided flow.
  // In this example, we assume facility activity pages reside under the ReportInformation step.
  const pagesToInclude: ReportingPage[] =
    flow[HeaderStep.ReportInformation]?.filter((page) =>
      [
        ReportingPage.Activities,
        ReportingPage.NonAttributableEmission,
        ReportingPage.EmissionSummary,
        ReportingPage.ProductionData,
        ReportingPage.AllocationOfEmissions,
      ].includes(page),
    ) || [];

  // Mapping from ReportingPage to the corresponding factory function
  const pageMapping: Partial<
    Record<ReportingPage, (...args: any[]) => Promise<ReviewData[]>>
  > = {
    [ReportingPage.Activities]: activityFactoryItem,
    [ReportingPage.NonAttributableEmission]:
      nonAttributableEmissionsFactoryItem,
    [ReportingPage.EmissionSummary]: emissionsSummaryFactoryItem,
    [ReportingPage.ProductionData]: productionDataFactoryItem,
    [ReportingPage.AllocationOfEmissions]: allocationOfEmissionsFactoryItem,
  };

  for (const facility of facilities) {
    if (facility.is_selected) {
      let items: ReviewData[] = [];
      for (const page of pagesToInclude) {
        const factoryFn = pageMapping[page];
        if (factoryFn) {
          const pageItems = await factoryFn(versionId, facility.facility_id);
          items.push(...pageItems);
        }
      }
      console.log(`Items for facility ${facility.facility__name}:`, items);

      reviewData.push({
        schema: {
          type: "object",
          title: `Report Information - ${facility.facility__name}`,
          properties: {},
        },
        uiSchema: {},
        data: {},
        items,
      });
    }
  }

  return reviewData;
}
