import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const sfoReportingOnlyFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperationInfo,
    ReportingPage.PersonResponsible,
  ],
  [HeaderStep.ReportInformation]: [
    ReportingPage.Activities,
    ReportingPage.NonAttributableEmission,
    ReportingPage.EmissionSummary,
  ],
  [HeaderStep.AdditionalInformation]: [ReportingPage.AdditionalReportingData],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
