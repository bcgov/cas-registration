import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { ActivityData } from "./2_facilitiesInformation";

export enum ReportingPage {
  ReviewOperatorInfo = "ReviewOperatorInfo",
  PersonResponsible = "PersonResponsible",
  ReviewFacilities = "ReviewFacilities",

  FacilitiesTable = "FacilitiesTable",
  ReviewInformation = "ReviewInformation",
  Activities = "Activities",
  NonAttributableEmission = "NonAttributableEmission",
  EmissionSummary = "EmissionSummary",
  ProductionData = "ProductionData",
  AllocationOfEmissions = "AllocationOfEmissions",
  EndOfReport = "EndOfReport",

  EmissionsData = "EmissionsData",

  AdditionalReportingData = "AdditionalReportingData",
  NewEntrantInformation = "NewEntrantInformation",
  OperationEmissionSummary = "OperationEmissionSummary",

  ComplianceSummary = "ComplianceSummary",

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
  NewEntrantSFO = "New Entrant - SFO",
  NewEntrantLFO = "New Entrant - LFO",
}

export enum HeaderStep {
  OperationInformation = "Operation Information",
  ReportInformation = "Report Information",
  EmissionsData = "Emissions Data",
  AdditionalInformation = "Additional Information",
  ComplianceSummary = "Compliance Summary",
  SignOffSubmit = "Sign-off & Submit",
}

export type ReportingFlowDescription = {
  [key in HeaderStep]?: ReportingPage[];
};

export type NavigationInformation = {
  taskList: TaskListElement[];
  continueUrl: string;
  backUrl: string;
  headerSteps: HeaderStep[];
  headerStepIndex: number;
};

export interface TaskListPageFactoryData {
  element: TaskListElement;
  continueUrl?: string;
  backUrl?: string;
  extraOptions?: {
    // Setting this flag to `true` will cause the tasklist element factory
    // to prop that element above all the other ones.
    taskListHeader?: boolean;

    // Setting this flag to `true` will cause the tasklist element factory
    // to skip it when building the task list.
    skip?: boolean;
  };
}

// This is not ideal practice to describe the specific items of that context object,
// because it tightly couples the generic type to the specifics of individual factories.
// But it will help developers knowing what they can expect to set and access
// when building the factories.
export interface TaskListPageFactoryContext {
  facilityName?: string;
  expandActivities?: boolean;
  orderedActivities?: ActivityData[];
  currentActivity?: ActivityData;
  skipVerification?: boolean;
}

type SyncTaskListPageFactory = (
  activePage: ReportingPage,
  reportVersionId: number,
  facilityId: string,
  context?: TaskListPageFactoryContext,
) => TaskListPageFactoryData;
type AsyncTaskListPageFactory = (
  activePage: ReportingPage,
  reportVersionId: number,
  facilityId: string,
  context?: TaskListPageFactoryContext,
) => Promise<TaskListPageFactoryData>;
export type TaskListPageFactory =
  | SyncTaskListPageFactory
  | AsyncTaskListPageFactory;
