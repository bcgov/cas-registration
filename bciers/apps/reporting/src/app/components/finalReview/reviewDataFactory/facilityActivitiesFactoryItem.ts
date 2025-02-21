import activityFactoryItem from "./activityFactoryItem";
import nonAttributableEmissionsFactoryItem from "./nonAttributableEmissionsFactoryItem";
import emissionsSummaryFactoryItem from "./emissionsSummaryFactoryItem";
import productionDataFactoryItem from "./productionDataFactoryItem";
import allocationOfEmissionsFactoryItem from "./allocationOfEmissionsFactoryItem";
import { ReviewData } from "./factory";

export default async function facilityActivitiesFactoryItem(
  versionId: number,
  facilities: {
    facility_id: string;
    facility__name: string;
    is_selected: boolean;
  }[],
): Promise<ReviewData[]> {
  const reviewData: ReviewData[] = [];

  for (const facility of facilities) {
    if (facility.is_selected) {
      reviewData.push({
        schema: {
          type: "object",
          title: `Report Information - ${facility.facility__name}`,
          properties: {},
        },
        uiSchema: {},
        data: {},
        items: [
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
      });
    }
  }

  return reviewData;
}
