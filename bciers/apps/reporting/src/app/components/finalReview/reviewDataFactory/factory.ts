import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
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
  const facilityId = (await getFacilityReport(versionId)).facility_id;
  const currentFacilities = (await getOperationFacilitiesList(versionId)) || [];

  const reviewData: ReviewData[] = [
    ...(await operationReviewFactoryItem(versionId, facilityId)),
    ...(await personResponsibleFactoryItem(versionId, facilityId)),
    // Facility activities will be inserted here
    ...(await nonAttributableEmissionsFactoryItem(versionId, facilityId)),
    ...(await emissionsSummaryFactoryItem(versionId, facilityId)),
    ...(await productionDataFactoryItem(versionId, facilityId)),
    ...(await allocationOfEmissionsFactoryItem(versionId, facilityId)),
    ...(await additionalReportingDataFactoryItem(versionId, facilityId)),
    ...(await complianceSummaryFactoryItem(versionId, facilityId)),
  ];

  let insertIndex = 2; // Third position in the array

  for (const facility of currentFacilities.current_facilities) {
    if (facility.is_selected) {
      const facilityActivities = await activityFactoryItem(
        versionId,
        facility.facility_id,
      );

      reviewData.splice(insertIndex, 0, {
        schema: {
          type: "object",
          title: `Report Information - ${facility.facility__name}`,
          properties: {},
        },
        uiSchema: {},
        data: facilityActivities,
        isCollapsible: true, // Marks this section as collapsible
      });

      insertIndex++; // Adjust the index for multiple selected facilities
    }
  }

  return reviewData;
}
