import ComplianceSummaryForm from "@reporting/src/app/components/complianceSummary/ComplianceSummaryForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getComplianceData } from "@reporting/src/app/utils/complianceSummaryForm/getComplianceData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { ComplianceSummaryFormPayload } from "@reporting/src/app/components/complianceSummary/types";

export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const response = await getComplianceData(version_id);

  const { payload, report_data } = response;

  const navInfo = await getNavigationInformation(
    HeaderStep.ComplianceSummary,
    ReportingPage.ComplianceSummary,
    version_id,
    "",
  );

  const summaryFormData: ComplianceSummaryFormPayload = {
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
