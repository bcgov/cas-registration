import FacilityReviewForm from "./FacilityReviewForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { buildFacilitySchema } from "@reporting/src/data/jsonSchema/facilities";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { fetchFacilityReviewPageData } from "./fetchFacilityReviewPageData";

export default async function FacilityReviewPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const data = await fetchFacilityReviewPageData(version_id, facility_id);
  const facilityData = data.payload;
  const activitiesData = data.applicable_activities;
  const selectedActivities = activitiesData.filter((item: { id: any }) =>
    facilityData.activities.includes(item.id),
  );

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.ReviewInformation,
    version_id,
    facility_id,
    {
      facilityName: facilityData?.facility_name,
      orderedActivities: orderedActivities,
    },
  );

  const formData = {
    ...facilityData,
    activities: selectedActivities.map(
      (activity: { name: any }) => activity.name,
    ),
  };
  const isSyncAllowed = facilityData.is_sync_allowed ?? true;
  const reviewSchema = buildFacilitySchema(activitiesData, isSyncAllowed);
  return (
    <FacilityReviewForm
      version_id={version_id}
      facility_id={facility_id}
      activitiesData={activitiesData}
      navigationInformation={navInfo}
      formsData={formData}
      schema={reviewSchema}
      operationId={facilityData.operation_id}
      isSyncAllowed={isSyncAllowed}
    />
  );
}
