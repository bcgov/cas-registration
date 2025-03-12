import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { ReportingPage, TaskListPageFactory } from "./types";

export type ActivityData = { id: number; name: string; slug: string };

const activitiesPageFactory: TaskListPageFactory = (
  activePage,
  reportVersionId,
  facilityId,
  context,
) => {
  const isActivityListExpanded = context?.expandActivities ?? true;

  const activitiesPageElements: TaskListElement[] = (
    context?.orderedActivities ?? []
  ).map(
    (activity: ActivityData, index: number) =>
      ({
        type: "Page",
        title: activity.name,
        link: `/reports/${reportVersionId}/facilities/${facilityId}/activities?activity_id=${activity.id}&step=${index}`,
        isActive:
          context?.orderedActivities?.indexOf(context?.currentActivity) ===
          index,
      }) as TaskListElement,
  );

  const taskListSection: TaskListElement = {
    type: "Section",
    title: "Activities information",
    isExpanded: isActivityListExpanded,
    elements: activitiesPageElements,
  };

  const activePageIndex =
    activitiesPageElements.findIndex((e) => e.isActive) ?? -1;

  return {
    backUrl:
      activePageIndex > 0
        ? activitiesPageElements[activePageIndex - 1].link
        : undefined,
    continueUrl:
      activePageIndex < activitiesPageElements.length - 1
        ? activitiesPageElements[activePageIndex + 1].link
        : undefined,
    element: taskListSection,
  };
};

export const facilitiesInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.FacilitiesTable]: (activePage, reportVersionId) => ({
    continueUrl: `/reports/${reportVersionId}/additional-reporting-data`,
    element: {
      type: "Link",
      text: "Back to facilities table",
      link: `/reporting/reports/${reportVersionId}/facilities/report-information`,
      title: "Back to facilities table",
    },
    extraOptions: {
      taskListHeader: true,
    },
  }),
  [ReportingPage.ReviewInformation]: (
    activePage,
    reportVersionId,
    facilityId,
  ) => ({
    element: {
      type: "Page",
      title: "Review facility information",
      isActive: activePage === ReportingPage.ReviewInformation,
      link: `/reports/${reportVersionId}/facilities/${facilityId}/review-facility-information`,
    },
  }),
  [ReportingPage.Activities]: activitiesPageFactory,
  [ReportingPage.NonAttributableEmission]: (
    activePage,
    reportVersionId,
    facilityId,
  ) => ({
    element: {
      type: "Page",
      title: "Non-attributable emissions",
      isActive: activePage === ReportingPage.NonAttributableEmission,
      link: `/reports/${reportVersionId}/facilities/${facilityId}/non-attributable`,
    },
  }),
  [ReportingPage.EmissionSummary]: (
    activePage,
    reportVersionId,
    facilityId,
  ) => ({
    element: {
      type: "Page",
      title: "Emissions summary",
      isActive: activePage === ReportingPage.EmissionSummary,
      link: `/reports/${reportVersionId}/facilities/${facilityId}/emission-summary`,
    },
  }),
  [ReportingPage.ProductionData]: (
    activePage,
    reportVersionId,
    facilityId,
  ) => ({
    element: {
      type: "Page",
      title: "Production data",
      link: `/reports/${reportVersionId}/facilities/${facilityId}/production-data`,
      isActive: activePage === ReportingPage.ProductionData,
    },
  }),
  [ReportingPage.AllocationOfEmissions]: (
    activePage,
    reportVersionId,
    facilityId,
  ) => ({
    element: {
      type: "Page",
      title: "Allocation of emissions",
      isActive: activePage === ReportingPage.AllocationOfEmissions,
      link: `/reports/${reportVersionId}/facilities/${facilityId}/allocation-of-emissions`,
    },
  }),
  [ReportingPage.EndOfReport]: (activePage, reportVersionId, facilityId) => ({
    continueUrl: `/reports/${reportVersionId}/facilities/report-information`,
    element: {
      type: "Page",
      title: "Facility Report Completed",
      isActive: activePage === ReportingPage.EndOfReport,
      link: `/reports/${reportVersionId}/facilities/${facilityId}/end-of-facility-report`,
    },
  }),
};
