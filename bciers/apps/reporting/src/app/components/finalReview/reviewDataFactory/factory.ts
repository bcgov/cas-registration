import { RJSFSchema } from "@rjsf/utils";
import operationReviewFactoryItem from "./operationReviewFactoryItem";
import personResponsibleFactoryItem from "./personResponsibleFactoryItem";
import facilityActivitiesFactoryItem from "./facilityActivitiesFactoryItem";
import additionalReportingDataFactoryItem from "./additionalReportingDataFactoryItem";
import complianceSummaryFactoryItem from "./complianceSummaryFactoryItem";
import operationEmissionSummaryFactoryItem from "./operationEmissionSummaryFactoryItem";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";

export type ReviewData = {
  schema: RJSFSchema;
  uiSchema: Object | string;
  data: any;
  context?: any;
  items?: ReviewData[];
  isCollapsible?: boolean;
};

export type ReviewDataFactoryItem = (
  version_id: number,
  facility_id: string,
) => Promise<ReviewData[]>;

export default async function reviewDataFactory(
  versionId: number,
): Promise<ReviewData[]> {
  // Fetch facilities for this report version
  const listFacilities = (await getOperationFacilitiesList(versionId)) || [];
  const currentFacilities = listFacilities.current_facilities;
  const facilityId = currentFacilities[0].facility_id;
  const operationType = currentFacilities.length > 1 ? "LFO" : "SFO";

  let reviewData: ReviewData[] = [
    ...(await operationReviewFactoryItem(versionId, facilityId)),
    ...(await personResponsibleFactoryItem(versionId, facilityId)),
    ...(await facilityActivitiesFactoryItem(versionId, currentFacilities)),
    ...(await additionalReportingDataFactoryItem(versionId, facilityId)),
    ...(await complianceSummaryFactoryItem(versionId, facilityId)),
  ];

  // Insert operationEmissionSummaryFactoryItem if operationType is "LFO"
  if (operationType === "LFO") {
    const emissionSummary = await operationEmissionSummaryFactoryItem(
      versionId,
      facilityId,
    );
    reviewData.splice(reviewData.length - 1, 0, ...emissionSummary);
  }

  return reviewData;
}
