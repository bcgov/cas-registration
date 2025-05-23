import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const lfoReportingOnlyFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperationInfo,
    ReportingPage.PersonResponsible,
    ReportingPage.ReviewFacilities,
  ],
  [HeaderStep.ReportInformation]: [
    ReportingPage.FacilitiesTable,
    ReportingPage.ReviewInformation,
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
    ReportingPage.ChangeReview,
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
