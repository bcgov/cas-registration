import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceData } from "@reporting/src/app/utils/getComplianceData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const response = await getComplianceData(version_id);

  const { payload, facility_data } = response;

  const facilityId = facility_data?.facility_id;

  const navInfo = await getNavigationInformation(
    HeaderStep.ComplianceSummary,
    ReportingPage.ComplianceSummary,
    version_id,
    facilityId ?? "",
  );

  return (
    <ComplianceSummaryForm
      summaryFormData={payload}
      navigationInformation={navInfo}
    />
  );
}
