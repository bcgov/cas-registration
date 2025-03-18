import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const sfoNewEntrantFlow: ReportingFlowDescription = {
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
  [HeaderStep.AdditionalInformation]: [
    ReportingPage.AdditionalReportingData,
    ReportingPage.NewEntrantInformation,
  ],
  [HeaderStep.ComplianceSummary]: [ReportingPage.ComplianceSummary],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
