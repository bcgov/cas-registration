import React from "react";
import { actionHandler } from "@bciers/actions";
import ComplianceSummary from "./ComplianceSummary";
import { tasklistData } from "./TaskListElements";

interface Props {
  versionId: number;
}

const getComplianceData = async (versionId: number) => {
  return actionHandler(
    `reporting/report-version/${versionId}/compliance-data`,
    "GET",
    `reporting/report-version/${versionId}/compliance-data`,
  );
};

const ComplianceSummaryData = async ({ versionId }: Props) => {
  const complianceData = await getComplianceData(versionId);

  return (
    <ComplianceSummary
      versionId={versionId}
      summaryFormData={complianceData}
      taskListElements={tasklistData}
    />
  );
};

export default ComplianceSummaryData;
