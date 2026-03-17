import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const eioFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperationInfo,
    ReportingPage.PersonResponsible,
  ],
  [HeaderStep.ReportInformation]: [ReportingPage.ElectricityImportData],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.ChangeReview,
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
