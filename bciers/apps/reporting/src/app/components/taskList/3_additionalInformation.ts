import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  AdditionalInformation = 1,
  NewEntrant,
  OperationEmissionSummary,
}

/**
 * Generate the task list for operation information reporting.
 *
 * @param versionId - The report version ID.
 * @param activeIndex - The currently active page index.
 * @param isNewEntrant - boolen value to tell if registration purpose in new entrant.

 * @returns Task list elements.
 */
export const getAdditionalInformationTaskList = (
  versionId: number,
  activeIndex?: ActivePage | number,
  isNewEntrant?: boolean,
): TaskListElement[] => {
  const isActivePage = (page: ActivePage) => activeIndex === page;

  const taskListElements: TaskListElement[] = [
    {
      type: "Page",
      title: "Additional reporting data",
      isActive: isActivePage(ActivePage.AdditionalInformation),
      link: `/reports/${versionId}/additional-reporting-data`,
    },
  ];

  if (isNewEntrant) {
    taskListElements.push({
      type: "Page",
      title: "New entrant information",
      link: `/reports/${versionId}/new-entrant-information`,
      isActive: isActivePage(ActivePage.NewEntrant),
    });
  }
  return taskListElements;
};
