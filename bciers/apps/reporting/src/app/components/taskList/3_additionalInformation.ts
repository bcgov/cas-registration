import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { OperationTypes } from "@bciers/utils/src/enums";

export enum ActivePage {
  "AdditionalReportingData" = 1,
  "NewEntrantInformation",
  "OperationEmissionSummary",
}

export const getAdditionalInformationTaskList: (
  versionId: number,
  activeIndex?: ActivePage | number,
  isNewEntrant?: boolean,
  operationType?: string,
) => TaskListElement[] = (
  versionId,
  activeIndex,
  isNewEntrant,
  operationType,
) => {
  const additionalReportingDataItem: TaskListElement = {
    type: "Page",
    title: "Additional reporting data",
    link: `/reports/${versionId}/additional-reporting-data`,
    isActive: activeIndex === ActivePage.AdditionalReportingData,
  };

  const newEntrantItem: TaskListElement = {
    type: "Page",
    title: "New entrant information",
    isActive: activeIndex === ActivePage.NewEntrantInformation,
    link: `/reports/${versionId}/new-entrant-information`,
  };

  const operationEmissionSummaryItem: TaskListElement = {
    type: "Page",
    title: "Operation emission summary",
    isActive: activeIndex === ActivePage.OperationEmissionSummary,
    link: `/reports/${versionId}/operation-emission-summary`,
  };

  const taskList: TaskListElement[] = [additionalReportingDataItem];

  // Add new entrant item if applicable
  if (isNewEntrant) {
    taskList.push(newEntrantItem);
  }

  // Add operation emission summary item only if operationType is "Linear Facilities Operation"
  if (operationType === OperationTypes.LFO) {
    taskList.push(operationEmissionSummaryItem);
  }

  return taskList;
};
