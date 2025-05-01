import formatTimestamp from "@bciers/utils/src/formatTimestamp";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";
import SubmissionSuccess from "@reporting/src/app/components/submission/SubmissionSuccess";

const SubmissionPage = async ({ version_id }: HasReportVersion) => {
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  const reportVersionDetails = await getReportVersionDetails(version_id);
  const submissionDate =
    reportVersionDetails.updated_at &&
    formatTimestamp(reportVersionDetails.updated_at);

  const reportId = reportVersionDetails.report;

  return (
    <SubmissionSuccess
      submissionDate={submissionDate}
      isSupplementaryReport={
        isSupplementaryReport.is_supplementary_report_version
      }
      reportId={reportId}
    />
  );
};

export default SubmissionPage;
