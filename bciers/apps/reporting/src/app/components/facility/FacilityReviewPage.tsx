import FacilityReviewForm from "./FacilityReviewForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { getAllActivities } from "@reporting/src/app/utils/getAllActivities";
import { buildFacilitySchema } from "@reporting/src/data/jsonSchema/facilities";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

export default async function FacilityReviewPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const facilityData = await getFacilityReportDetails(version_id, facility_id);
  const activitiesData = await getAllActivities();
  const selectedActivities = activitiesData.filter((item: { id: any }) =>
    facilityData.activities.includes(item.id),
  );

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.ReviewInformation,
    version_id,
    facility_id,
    {
      facilityName: facilityData?.facilityName,
      orderedActivities: orderedActivities,
    },
  );

  const formData = {
    ...facilityData,
    activities: selectedActivities.map(
      (activity: { name: any }) => activity.name,
    ),
  };
  const reviewSchema = buildFacilitySchema(activitiesData);
  return (
    <FacilityReviewForm
      version_id={version_id}
      facility_id={facility_id}
      activitiesData={activitiesData}
      navigationInformation={navInfo}
      formsData={formData}
      schema={reviewSchema}
    />
  );
}
