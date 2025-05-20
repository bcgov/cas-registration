import { RJSFSchema } from "@rjsf/utils";
import operationReviewFactoryItem from "./operationReviewFactoryItem";
import personResponsibleFactoryItem from "./personResponsibleFactoryItem";
import facilityActivitiesFactoryItem from "./facilityActivitiesFactoryItem";
import additionalReportingDataFactoryItem from "./additionalReportingDataFactoryItem";
import newEntrantInformationFactoryItem from "./newEntrantInformationFactoryItem";
import complianceSummaryFactoryItem from "./complianceSummaryFactoryItem";
import operationEmissionSummaryFactoryItem from "./operationEmissionSummaryFactoryItem";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import {
  ReportingPage,
  ReportingFlowDescription,
} from "@reporting/src/app/components/taskList/types";
import electricityImportDataFactoryItem from "@reporting/src/app/components/finalReview/reviewDataFactory/electricityImportDataFactoryItem";
import changeReviewFactoryItem from "@reporting/src/app/components/finalReview/reviewDataFactory/changeReviewFactoryItem";

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

  // Mapping from ReportingPage to the corresponding factory function
  const factoryMapping: Partial<
    Record<ReportingPage, (...args: any[]) => Promise<ReviewData[]>>
  > = {
    [ReportingPage.PersonResponsible]: personResponsibleFactoryItem,
    [ReportingPage.ReviewOperationInfo]: operationReviewFactoryItem,
    [ReportingPage.Activities]: facilityActivitiesFactoryItem,
    [ReportingPage.ElectricityImportData]: electricityImportDataFactoryItem,
    [ReportingPage.AdditionalReportingData]: additionalReportingDataFactoryItem,
    [ReportingPage.NewEntrantInformation]: newEntrantInformationFactoryItem,
    [ReportingPage.OperationEmissionSummary]:
      operationEmissionSummaryFactoryItem,
    [ReportingPage.ComplianceSummary]: complianceSummaryFactoryItem,
    [ReportingPage.ChangeReview]: changeReviewFactoryItem,
  };

  let reviewData: ReviewData[] = [];
  // Iterate over the provided flow's header steps and their associated pages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [headerStep, pages] of Object.entries(flow)) {
    for (const page of pages) {
      const factoryFn = factoryMapping[page];
      if (factoryFn) {
        let pageData: ReviewData[] = [];
        // Determine parameters based on the ReportingPage
        pageData = await factoryFn(versionId, currentFacilities, flow);
        // Only push if there's actually something there
        if (pageData.length > 0) {
          reviewData.push(...pageData);
        }
      }
    }
  }
  const reorderedReviewData = [
    ...reviewData.filter((sec) => sec.schema.title === "Reason for Edits"),
    ...reviewData.filter((sec) => sec.schema.title !== "Reason for Edits"),
  ];
  return reorderedReviewData;
}
