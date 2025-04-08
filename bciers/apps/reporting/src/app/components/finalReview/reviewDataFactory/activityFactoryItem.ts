import { ReviewData, ReviewDataFactoryItem } from "./factory";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import { getActivityInitData } from "@reporting/src/app/utils/getActivityInitData";
import { getActivityFormData } from "@reporting/src/app/utils/getActivityFormData";
import { getActivitySchema } from "@reporting/src/app/utils/getActivitySchema";
import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";

const activityFactoryItem: ReviewDataFactoryItem = async (
  versionId: number,
  facilityId,
) => {
  const orderedActivities: any[] = await getOrderedActivities(
    versionId,
    facilityId,
  );

  const activityReviewData: ReviewData[] = [];

  for (const activity of orderedActivities) {
    const initData = safeJsonParse(
      await getActivityInitData(versionId, facilityId, activity.id),
    );

    const formData = await getActivityFormData(
      versionId,
      facilityId,
      activity.id,
    );

    const sourceTypeQueryString = formData?.sourceTypes
      ? Object.entries(initData.sourceTypeMap)
          .filter(([, v]) => String(v) in formData.sourceTypes)
          .map(([k]) => `&source_types[]=${k}`)
          .join("")
      : "";
    const facilityType = (await getFacilityReportDetails(versionId, facilityId)).facility_type;

    const schema = safeJsonParse(
      await getActivitySchema(versionId, activity.id, sourceTypeQueryString, facilityType),
    ).schema;
    activityReviewData.push({
      schema: schema,
      uiSchema: activity.slug,
      data: formData,
    });
  }

  return activityReviewData;
};

export default activityFactoryItem;
