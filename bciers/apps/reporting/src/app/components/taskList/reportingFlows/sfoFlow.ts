import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const sfoFlow: ReportingFlowDescription = {
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
