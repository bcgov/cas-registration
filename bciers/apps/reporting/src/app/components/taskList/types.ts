import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ReportingPage {
  // 1
  ReviewOperatorInfo = "ReviewOperatorInfo",
  PersonResponsible = "PersonResponsible",
  ReviewFacilities = "ReviewFacilities",
  // 2
  ReviewInformation = "ReviewInformation",
  Activities = "Activities",
  NonAttributableEmission = "NonAttributableEmission",
  EmissionSummary = "EmissionSummary",
  ProductionData = "ProductionData",
  AllocationOfEmissions = "AllocationOfEmissions",
  // 3
  AdditionalReportingData = "AdditionalReportingData",
  NewEntrantInformation = "NewEntrantInformation",
  OperationEmissionSummary = "OperationEmissionSummary",
  // 4
  ComplianceSummary = "ComplianceSummary",
  // 5
  Verification = "Verification",
  Attachments = "Attachments",
  FinalReview = "FinalReview",
  SignOff = "SignOff",
}

export enum ReportingFlow {
  SFO = "SFO",
  LFO = "LFO",
  SimpleReport = "Simple Report",
  EIO = "EIO",
  ReportingOnlySFO = "Reporting Only - SFO",
  ReportingOnlyLFO = "Reporting Only - LFO",
}

export enum HeaderStep {
  OperationInformation = "Operation Information",
  ReportInformation = "Report Information",
  AdditionalInformation = "Additional Information",
  ComplianceSummary = "Compliance Summary",
  SignOffSubmit = "Sign-off & Submit",
}

export type ReportingFlowDescription = {
  [key in HeaderStep]?: ReportingPage[];
};

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
  element: TaskListElement;
  continueUrl?: string;
  backUrl?: string;
};

export type AsyncTaskListPageFactory = (
  activePage: ReportingPage,
  reportVersionId: number,
  context?: Object,
) => Promise<{
  element: TaskListElement;
  continueUrl?: string;
  backUrl?: string;
}>;
