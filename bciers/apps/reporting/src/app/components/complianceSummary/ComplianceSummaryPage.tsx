import React from "react";
import { actionHandler } from "@bciers/actions";
import ComplianceSummaryForm from "./ComplianceSummaryForm";
import { tasklistData } from "./TaskListElements";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

const getComplianceData = async (versionId: number) => {
  return actionHandler(
    `reporting/report-version/${versionId}/compliance-data`,
    "GET",
    `reporting/report-version/${versionId}/compliance-data`,
  );
};
export default async function ComplianceSummaryPage({
  version_id,
}: HasReportVersion) {
  const complianceData = await getComplianceData(version_id);
  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  return (
    <ComplianceSummaryForm
      versionId={version_id}
      needsVerification={needsVerification}
      summaryFormData={complianceData}
      taskListElements={tasklistData}
    />
  );
}
