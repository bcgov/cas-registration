import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  ReportOperationInformation = 1,
  PersonResponsible,
  ReviewFacilities,
}

/**
 * Generate the task list for operation information reporting.
 *
 * @param versionId - The report version ID.
 * @param activeIndex - The currently active page index.
 * @param facilityPageUrl - Optional URL for the "Review facilities" page.
 * @param operationType - The type of operation (e.g., "Linear Facility Operation").
 * @returns Task list elements.
 */
export const getOperationInformationTaskList = (
  versionId: number,
  activeIndex?: ActivePage | number,
  facilityPageUrl?: string,
  operationType?: string,
): TaskListElement[] => {
  const isActivePage = (page: ActivePage) => activeIndex === page;

  const elements: TaskListElement[] = [
    {
      type: "Page",
      title: "Review Operation Information",
      link: `/reporting/reports/${versionId}/review-operator-data`,
      isActive: isActivePage(ActivePage.ReportOperationInformation),
    },
    {
      type: "Page",
      title: "Person Responsible",
      link: `/reporting/reports/${versionId}/person-responsible`,
      isActive: isActivePage(ActivePage.PersonResponsible),
    },
  ];

  // Conditionally add "Review Facilities" page
  if (operationType && operationType === "Linear Facility Operation") {
    elements.push({
      type: "Page",
      title: "Review Facilities",
      link: facilityPageUrl,
      isActive: isActivePage(ActivePage.ReviewFacilities),
    });
  }

  return [
    {
      type: "Section",
      title: "Operation information",
      isExpanded: true,
      elements,
    },
  ];
};
