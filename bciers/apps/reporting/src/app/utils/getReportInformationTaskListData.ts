import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

export const getReportInformationTasklist = async (
  reportVersionId: number,
  facilityId: string,
) => {
  const operationType = await getFacilityReport(reportVersionId);

  const facilityData = await getFacilityReportDetails(
    reportVersionId,
    facilityId,
  );

  return {
    facilityName: facilityData?.facility_name,
    operationType: operationType?.operation_type,
  };
};
