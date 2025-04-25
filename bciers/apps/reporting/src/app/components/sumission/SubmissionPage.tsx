import { getTodaysDateWithTime } from "@reporting/src/app/utils/formatDate";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";
import SubmissionSuccess from "@reporting/src/app/components/sumission/SubmissionSuccess";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";

const SubmissionPage = async ({ version_id }: HasReportVersion) => {
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  const reportVersionDetails = await getReportVersionDetails(version_id);
  const submissionDate =
    formatTimestamp(
      reportVersionDetails.updated_at || getTodaysDateWithTime(),
    ) || "";

  console.log("Submission Date:", submissionDate);

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
