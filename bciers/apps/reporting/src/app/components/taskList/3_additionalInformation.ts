import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "AdditionalReportingData" = 1,
  "NewEntrantInformation",
}

export const getAdditionalInformationTaskList = (
  versionId: number,
  activeIndex?: ActivePage | number,
) => {
  const taskListData: TaskListElement[] = [
    {
      type: "Page",
      title: "Additional reporting data",
      isChecked: true,
      link: `/reports/${versionId}/additional-reporting-data`,
      isActive: activeIndex === ActivePage.AdditionalReportingData,
    },
    {
      type: "Page",
      title: "New entrant information",
      isActive: activeIndex === ActivePage.NewEntrantInformation,
      link: `/reports/${versionId}/new-entrant-information`,
    },
  ];

  return taskListData;
};
