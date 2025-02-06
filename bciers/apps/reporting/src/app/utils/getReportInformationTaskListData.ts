import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

export const getReportInformationTasklist = async (
  versionId: number,
  facilityId: string,
) => {
  const operationType = await getFacilityReport(versionId);

  const facilityData = await getFacilityReportDetails(versionId, facilityId);

  return {
    facilityName: facilityData?.facility_name,
    operationType: operationType?.operation_type,
  };
};
