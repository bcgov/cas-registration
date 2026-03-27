import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceData } from "@reporting/src/app/utils/complianceSummaryForm/getComplianceData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { ComplianceSummaryFormData } from "@reporting/src/app/components/complianceSummary/types";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const response = await getComplianceData(version_id);

  const { payload, report_data, facility_data } = response;

  const facilityId = facility_data?.facility_id;

  const navInfo = await getNavigationInformation(
    HeaderStep.ComplianceSummary,
    ReportingPage.ComplianceSummary,
    version_id,
    facilityId ?? "",
  );

  const summaryFormData: ComplianceSummaryFormData = {
    ...payload,
    reporting_year: report_data.reporting_year,
  };

  return (
    <ComplianceSummaryForm
      summaryFormData={summaryFormData}
      navigationInformation={navInfo}
    />
  );
}
