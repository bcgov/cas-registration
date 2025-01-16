import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import activityFactoryItem from "./activityFactoryItem";
import nonAttributableEmissionsFactoryItem from "./nonAttributableEmissionsFactoryItem";
import operationReviewFactoryItem from "./operationReviewFactoryItem";
import personResponsibleFactoryItem from "./personResponsibleFactoryItem";
import emissionsSummaryFactoryItem from "./emissionsSummaryFactoryItem";
import productionDataFactoryItem from "./productionDataFactoryItem";
import allocationOfEmissionsFactoryItem from "./allocationOfEmissions";

export type ReviewData = { schema: any; uiSchema: Object | string; data: any };
export type ReviewDataFactoryItem = (
  version_id: number,
  facility_id: string,
) => Promise<ReviewData[]>;

export default async function reviewDataFactory(
  versionId: number,
): Promise<ReviewData[]> {
  const facilityId = (await getFacilityReport(versionId)).facility_id;

  return [
    ...(await operationReviewFactoryItem(versionId, facilityId)),
    ...(await personResponsibleFactoryItem(versionId, facilityId)),
    ...(await activityFactoryItem(versionId, facilityId)),
    ...(await nonAttributableEmissionsFactoryItem(versionId, facilityId)),
    ...(await emissionsSummaryFactoryItem(versionId, facilityId)),
    ...(await productionDataFactoryItem(versionId, facilityId)),
    ...(await allocationOfEmissionsFactoryItem(versionId, facilityId)),
  ];
}
