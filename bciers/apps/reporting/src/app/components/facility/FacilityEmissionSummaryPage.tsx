import FacilityEmissionSummaryForm from "@reporting/src/app/components/facility/FacilityEmissionSummaryForm";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getSummaryData } from "@reporting/src/app/utils/getSummaryData";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

export default async function FacilityEmissionSummaryPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const summaryData = await getSummaryData(version_id, facility_id);
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const reportInfoTaskListData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.EmissionSummary,
    version_id,
    facility_id,
    {
      orderedActivities: orderedActivities,
      facilityName: reportInfoTaskListData?.facilityName,
    },
  );

  return (
    <FacilityEmissionSummaryForm
      summaryFormData={summaryData}
      navigationInformation={navInfo}
    />
  );
}
