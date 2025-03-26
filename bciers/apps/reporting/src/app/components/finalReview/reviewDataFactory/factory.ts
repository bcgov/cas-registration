import { RJSFSchema } from "@rjsf/utils";
import operationReviewFactoryItem from "./operationReviewFactoryItem";
import personResponsibleFactoryItem from "./personResponsibleFactoryItem";
import facilityActivitiesFactoryItem from "./facilityActivitiesFactoryItem";
import additionalReportingDataFactoryItem from "./additionalReportingDataFactoryItem";
import complianceSummaryFactoryItem from "./complianceSummaryFactoryItem";
import operationEmissionSummaryFactoryItem from "./operationEmissionSummaryFactoryItem";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import {
  ReportingPage,
  ReportingFlowDescription,
} from "@reporting/src/app/components/taskList/types";

export type ReviewData = {
  schema: RJSFSchema;
  uiSchema: Object | string;
  data: any;
  context?: any;
  items?: ReviewData[];
};

export type ReviewDataFactoryItem = (
  version_id: number,
  facility_id: string,
) => Promise<ReviewData[]>;

export default async function reviewDataFactory(
  versionId: number,
  flow: ReportingFlowDescription,
): Promise<ReviewData[]> {
  // Fetch facilities for this report version
  const listFacilities = (await getOperationFacilitiesList(versionId)) || [];
  const currentFacilities = listFacilities.current_facilities;
  const facilityId = currentFacilities[0].facility_id;

  // Mapping from ReportingPage to the corresponding factory function
  const factoryMapping: Partial<
    Record<ReportingPage, (...args: any[]) => Promise<ReviewData[]>>
  > = {
    [ReportingPage.ReviewOperationInfo]: operationReviewFactoryItem,
    [ReportingPage.PersonResponsible]: personResponsibleFactoryItem,
    [ReportingPage.Activities]: facilityActivitiesFactoryItem,
    [ReportingPage.AdditionalReportingData]: additionalReportingDataFactoryItem,
    [ReportingPage.OperationEmissionSummary]:
      operationEmissionSummaryFactoryItem,
    [ReportingPage.ComplianceSummary]: complianceSummaryFactoryItem,
  };

  let reviewData: ReviewData[] = [];
  // Iterate over the provided flow's header steps and their associated pages
  for (const [headerStep, pages] of Object.entries(flow)) {
    for (const page of pages) {
      const factoryFn = factoryMapping[page];
      if (factoryFn) {
        let pageData: ReviewData[] = [];
        // Determine parameters based on the ReportingPage
        switch (page) {
          case ReportingPage.Activities:
            pageData = await factoryFn(versionId, currentFacilities, flow);
            break;
          default:
            pageData = await factoryFn(versionId, facilityId);
            break;
        }
        reviewData.push(...pageData);
      }
    }
  }

  return reviewData;
}
