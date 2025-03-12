import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import EndOfFacilityForm from "@reporting/src/app/components/reportInformation/endOfFacility/EndOfFacilityForm";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";

export default async function EndOfFacilityPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const reportInfoTaskListData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );

  const facilityName = reportInfoTaskListData?.facilityName
    ? reportInfoTaskListData.facilityName
    : "Facility";

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.EndOfReport,
    version_id,
    facility_id,
    {
      orderedActivities,
      facilityName,
    },
  );

  return (
    <EndOfFacilityForm
      navigationInformation={navInfo}
      facilityName={facilityName}
    />
  );
}
