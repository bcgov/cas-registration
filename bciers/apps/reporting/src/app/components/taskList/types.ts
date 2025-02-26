import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ReportingFlow {
  SFO = "SFO",
  LFO = "LFO",
  SimpleReport = "Simple Report",
  EIO = "EIO",
  ReportingOnlySFO = "Reporting Only - SFO",
  ReportingOnlyLFO = "Reporting Only - LFO",
}

export type NavigationInformation = {
  // We might want to add the multistep header in here too
  taskList: TaskListElement[];
  continueUrl: string;
  backUrl: string;
};
