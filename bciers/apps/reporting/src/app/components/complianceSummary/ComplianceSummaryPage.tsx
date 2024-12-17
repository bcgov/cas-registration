import React from "react";
import { actionHandler } from "@bciers/actions";
import ComplianceSummaryForm from "./ComplianceSummaryForm";
import { tasklistData } from "./TaskListElements";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { getAttributableEmissions } from "@reporting/src/app/utils/getAttributableEmissions";
import {
  RegistrationPurposes,
  regulatedOperationPurposes,
} from "@/registration/app/components/operations/registration/enums";

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
  //🔍 Check if reports need verification step...
  let needsVerification = false;
  //🔍 Check if registration purpose is OBPS Regulated Operation, Opt-in or New Entrants
  const registrationPurpose = (await getRegistrationPurpose(version_id))
    ?.registration_purpose;
  needsVerification = regulatedOperationPurposes.includes(
    registrationPurpose as RegistrationPurposes,
  );
  if (
    needsVerification === false &&
    registrationPurpose === RegistrationPurposes.REPORTING_OPERATION
  ) {
    //🔍 Check if the registration purpose is Reporting Operation AND their total emissions attributable for reporting threshold is = or > than 25,000 TCo2
    const attributableEmissionThreshold = 25000000;
    const attributableEmissions = await getAttributableEmissions(version_id);
    needsVerification = attributableEmissions >= attributableEmissionThreshold;
  }
  return (
    <ComplianceSummaryForm
      versionId={version_id}
      needsVerification={needsVerification}
      summaryFormData={complianceData}
      taskListElements={tasklistData}
    />
  );
}
