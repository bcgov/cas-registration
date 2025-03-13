import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const sfoReportingOnlyFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperatorInfo,
    ReportingPage.PersonResponsible,
    ReportingPage.ReviewFacilities,
  ],
  [HeaderStep.ReportInformation]: [
    ReportingPage.Activities,
    ReportingPage.NonAttributableEmission,
    ReportingPage.EmissionSummary,
    ReportingPage.EndOfReport,
  ],
  [HeaderStep.AdditionalInformation]: [
    ReportingPage.AdditionalReportingData,
    ReportingPage.OperationEmissionSummary,
  ],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
