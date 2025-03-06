import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ReportingPage {
  // 1
  ReviewOperatorInfo,
  PersonResponsible,
  ReviewFacilities,
  // 2
  ReviewInformation,
  Activities,
  NonAttributableEmission,
  EmissionSummary,
  ProductionData,
  AllocationOfEmissions,
  // 3
  AdditionalReportingData,
  NewEntrantInformation,
  OperationEmissionSummary,
  // 4
  ComplianceSummary,
  // 5
  Verification,
  Attachments,
  FinalReview,
  SignOff,
}

export enum ReportingFlow {
  SFO = "SFO",
  LFO = "LFO",
  SimpleReport = "Simple Report",
  EIO = "EIO",
  ReportingOnlySFO = "Reporting Only - SFO",
  ReportingOnlyLFO = "Reporting Only - LFO",
}

export type ReportingFlowDescription = {
  [key in HeaderStep]?: ReportingPage[];
};

export enum HeaderStep {
  OperationInformation = "Operation Information",
  ReportInformation = "Report Information",
  AdditionalInformation = "Additional Information",
  ComplianceSummary = "Compliance Summary",
  SignOffSubmit = "Sign-off & Submit",
}

export type NavigationInformation = {
  // We might want to add the multistep header in here too
  taskList: TaskListElement[];
  continueUrl: string;
  backUrl: string;
};

export type TaskListPageFactory = (
  activePage: ReportingPage,
  reportVersionId: number,
  context?: Object,
) => {
  // The tasklist element associated with the page
  element: TaskListElement;

  // The factory can generate its own forward and back links
  // This would be used for example if the factory generates sub-pages and a hierarchy
  continueUrl?: string;
  backUrl?: string;
};
