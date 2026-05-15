import FacilityReviewForm from "./FacilityReviewForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { buildFacilitySchema } from "@reporting/src/data/jsonSchema/facilities";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

export default async function FacilityReviewPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const facilityData = await getFacilityReportDetails(version_id, facility_id);
  const facilityActivities = facilityData.facility_activities ?? [];
  const otherActivities = facilityData.other_activities ?? [];

  const savedActivityIds: number[] = facilityData.activities ?? [];
  const selectedFacilityActivityNames = facilityActivities
    .filter((a: { id: number }) => savedActivityIds.includes(a.id))
    .map((a: { name: string }) => a.name);
  const selectedOtherActivityNames = otherActivities
    .filter((a: { id: number }) => savedActivityIds.includes(a.id))
    .map((a: { name: string }) => a.name);

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
    facility_activities: selectedFacilityActivityNames,
    other_activities: selectedOtherActivityNames,
  };
  const isSyncAllowed = facilityData.is_sync_allowed ?? true;
  const reviewSchema = buildFacilitySchema(
    facilityActivities,
    otherActivities,
    isSyncAllowed,
  );
  return (
    <FacilityReviewForm
      version_id={version_id}
      facility_id={facility_id}
      facilityActivities={facilityActivities}
      otherActivities={otherActivities}
      navigationInformation={navInfo}
      formsData={formData}
      schema={reviewSchema}
      operationId={facilityData.operation_id}
      isSyncAllowed={isSyncAllowed}
    />
  );
}
