import { HeaderStep, ReportingFlowDescription, ReportingPage } from "../types";

export const lfoFlow: ReportingFlowDescription = {
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
  [HeaderStep.AdditionalInformation]: [
    ReportingPage.AdditionalReportingData,
    ReportingPage.OperationEmissionSummary,
  ],
  [HeaderStep.ComplianceSummary]: [ReportingPage.ComplianceSummary],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};
