import { getRegistrationPurpose } from "../../utils/getRegistrationPurpose";
import { getReportingOperation } from "../../utils/getReportingOperation";
import {
  HeaderStep,
  ReportingFlow,
  ReportingFlowDescription,
  ReportingPage,
} from "./types";

const sfoFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperatorInfo,
    ReportingPage.PersonResponsible,
  ],
  [HeaderStep.ReportInformation]: [
    ReportingPage.Activities,
    ReportingPage.NonAttributableEmission,
    ReportingPage.EmissionSummary,
    ReportingPage.ProductionData,
    ReportingPage.AllocationOfEmissions,
  ],
  [HeaderStep.AdditionalInformation]: [ReportingPage.AdditionalReportingData],
  [HeaderStep.ComplianceSummary]: [ReportingPage.ComplianceSummary],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};

const lfoFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperatorInfo,
    ReportingPage.PersonResponsible,
    ReportingPage.ReviewFacilities,
  ],
  [HeaderStep.ReportInformation]: [
    ReportingPage.FacilitiesTable,
    ReportingPage.ReviewInformation,
    ReportingPage.Activities,
    ReportingPage.NonAttributableEmission,
    ReportingPage.EmissionSummary,
    ReportingPage.ProductionData,
    ReportingPage.AllocationOfEmissions,
    ReportingPage.EndOfReport,
  ],
  [HeaderStep.AdditionalInformation]: [ReportingPage.AdditionalReportingData],
  [HeaderStep.ComplianceSummary]: [ReportingPage.ComplianceSummary],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};

export const reportingFlows: {
  [Flow in ReportingFlow]?: ReportingFlowDescription;
} = {
  [ReportingFlow.SFO]: sfoFlow,
  [ReportingFlow.LFO]: lfoFlow,
};

export async function getFlow(reportVersionId: number): Promise<ReportingFlow> {
  const reportOperationData = await getReportingOperation(reportVersionId);
  const registrationPurpose = (await getRegistrationPurpose(reportVersionId))
    .registration_purpose;

  const operationType = reportOperationData.operation_type;
  const reportType = reportOperationData.operation_report_type;

  if (reportType === "Simple Report") return ReportingFlow.SimpleReport;

  if (registrationPurpose === "Electricity Import Operation")
    return ReportingFlow.EIO;

  if (
    registrationPurpose === "Reporting Operation" &&
    operationType === "Single Facility Operation"
  )
    return ReportingFlow.ReportingOnlySFO;

  if (
    registrationPurpose === "Reporting Operation" &&
    operationType === "Linear Facilities Operation"
  )
    return ReportingFlow.ReportingOnlyLFO;

  if (operationType === "Single Facility Operation") return ReportingFlow.SFO;

  if (operationType === "Linear Facilities Operation") return ReportingFlow.LFO;

  throw new Error(
    `Unable to resolve reporting flow for registration purpose ${registrationPurpose.registration_purpose} and operation type ${operationType}`,
  );
}
