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

export const reportingFlows: {
  [Flow in ReportingFlow]?: ReportingFlowDescription;
} = {
  [ReportingFlow.SFO]: sfoFlow,
  // More to come
};

export async function getFlow(/*reportVersionId: number*/): Promise<ReportingFlow> {
  return ReportingFlow.SFO;
}
