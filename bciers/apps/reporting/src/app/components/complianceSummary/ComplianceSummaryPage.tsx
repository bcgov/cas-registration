import { extractFetchError } from "@bciers/utils/src/extractFetchError";
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
  const navInfo = await getNavigationInformation(
    HeaderStep.ComplianceSummary,
    ReportingPage.ComplianceSummary,
    version_id,
    "",
  );

  let summaryFormData: ComplianceSummaryFormPayload | undefined;
  let error: string | undefined;
  try {
    const { payload, report_data } = await getComplianceData(version_id);
    summaryFormData = {
      ...payload,
      reporting_year: report_data.reporting_year,
    };
  } catch (e) {
    error = extractFetchError(e);
  }

  return (
    <ComplianceSummaryForm
      summaryFormData={summaryFormData}
      navigationInformation={navInfo}
      error={error}
    />
  );
}
