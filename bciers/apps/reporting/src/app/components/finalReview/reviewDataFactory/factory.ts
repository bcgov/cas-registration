import activityFactoryItem from "./activityFactoryItem";
import operationReviewFactoryItem from "./operationReviewFactoryItem";
import personResponsibleFactoryItem from "./personResponsibleFactoryItem";

export type ReviewData = { schema: any; uiSchema: Object | string; data: any };
export type ReviewDataFactoryItem = (
  version_id: number,
) => Promise<ReviewData[]>;

export default async function reviewDataFactory(
  versionId: number,
): Promise<ReviewData[]> {
  return [
    ...(await operationReviewFactoryItem(versionId)),
    ...(await personResponsibleFactoryItem(versionId)),
    ...(await activityFactoryItem(versionId)),
  ];
}
