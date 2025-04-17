import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const eioFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperationInfo,
    ReportingPage.PersonResponsible,
  ],
  [HeaderStep.ElectricityImportData]: [ReportingPage.ElectricityImportData],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
