import activityFactoryItem from "./activityFactoryItem";
import nonAttributableEmissionsFactoryItem from "./nonAttributableEmissionsFactoryItem";
import operationReviewFactoryItem from "./operationReviewFactoryItem";
import personResponsibleFactoryItem from "./personResponsibleFactoryItem";
import emissionsSummaryFactoryItem from "./emissionsSummaryFactoryItem";
import productionDataFactoryItem from "./productionDataFactoryItem";
import allocationOfEmissionsFactoryItem from "./allocationOfEmissionsFactoryItem";
import { RJSFSchema } from "@rjsf/utils";
import additionalReportingDataFactoryItem from "./additionalReportingDataFactoryItem";
import complianceSummaryFactoryItem from "./complianceSummaryFactoryItem";
import operationEmissionSummaryFactoryItem from "./operationEmissionSummaryFactoryItem";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";

export type ReviewData = {
  schema: RJSFSchema;
  uiSchema: Object | string;
  data: any;
  context?: any;
  isCollapsible?: boolean;
};
export type ReviewDataFactoryItem = (
  version_id: number,
  facility_id: string,
) => Promise<ReviewData[]>;

export default async function reviewDataFactory(
  versionId: number,
): Promise<ReviewData[]> {
  // 🚀 Fetch facilities for this report version
  const listFacilities = (await getOperationFacilitiesList(versionId)) || [];
  const currentFacilities = listFacilities.current_facilities;
  const facilityId = currentFacilities[0].facility_id;
  const operationType = currentFacilities.length > 1 ? "LFO" : "SFO";

  const reviewData: ReviewData[] = [
    ...(await operationReviewFactoryItem(versionId, facilityId)),
    ...(await personResponsibleFactoryItem(versionId, facilityId)),
    // Facility activity data will be inserted here
    ...(await additionalReportingDataFactoryItem(versionId, facilityId)),
    ...(await complianceSummaryFactoryItem(versionId, facilityId)),
  ];

  let insertIndex = 2; // Third position in the array
  // Facility activity data
  for (const facility of currentFacilities) {
    if (facility.is_selected) {
      reviewData.splice(insertIndex, 0, {
        schema: {
          type: "object",
          title: `Report Information - ${facility.facility__name}`,
          properties: {},
        },
        uiSchema: {},
        data: [
          ...(await activityFactoryItem(versionId, facility.facility_id)),
          ...(await nonAttributableEmissionsFactoryItem(
            versionId,
            facility.facility_id,
          )),
          ...(await emissionsSummaryFactoryItem(
            versionId,
            facility.facility_id,
          )),
          ...(await productionDataFactoryItem(versionId, facility.facility_id)),
          ...(await allocationOfEmissionsFactoryItem(
            versionId,
            facility.facility_id,
          )),
        ],
        isCollapsible: true, // Marks this section as collapsible
      });

      insertIndex++; // Adjust the index for multiple selected facilities
    }
  }
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
