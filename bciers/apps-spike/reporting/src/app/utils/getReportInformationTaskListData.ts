import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

export const getReportInformationTasklist = async (
  reportVersionId: number,
  facilityId: string,
) => {
  const facilityReport = await getFacilityReport(reportVersionId);

  const facilityData = await getFacilityReportDetails(
    reportVersionId,
    facilityId,
  );

  return {
    facilityName: facilityData?.facility_name,
    operationType: facilityReport?.operation_type,
  };
};
