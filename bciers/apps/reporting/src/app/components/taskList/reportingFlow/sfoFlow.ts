import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const sfoFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperationInfo,
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
    ReportingPage.ChangeReview,
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
