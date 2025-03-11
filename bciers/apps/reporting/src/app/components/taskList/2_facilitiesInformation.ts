import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { OperationTypes } from "@bciers/utils/src/enums";
import { ReportingPage, TaskListPageFactory } from "./types";

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
    element: {
      type: "Link",
      text: "Back to facilities table",
      link: `/reporting/reports/${reportVersionId}/facilities/report-information`,
      title: "Back to facilities table",
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
};

export type ActivityData = { id: number; name: string; slug: string };

export enum ActivePage {
  ReviewInformation,
  NonAttributableEmission = 1,
  EmissionSummary,
  ProductionData,
  AllocationOfEmissions,
}

export const getFacilitiesInformationTaskList = (
  versionId: number,
  facilityId: string,
  orderedActivities: ReadonlyArray<ActivityData>,
  activeIndex?: ActivePage | number,
  facilityName?: string,
  operationType = OperationTypes.SFO,
  expandActivities?: boolean, //to disable activity
): TaskListElement[] => {
  const name = facilityName ? facilityName : "Facility";

  const isActivityListExpanded = expandActivities ?? true;

  const backToFacilitiesLink: TaskListElement[] =
    operationType === OperationTypes.LFO
      ? [
          {
            type: "Link",
            text: "Back to facilities table",
            link: `/reporting/reports/${versionId}/facilities/report-information`,
            title: "Back to facilities table",
          },
        ]
      : [];
  const facilityItem: TaskListElement[] =
    operationType !== OperationTypes.LFO
      ? []
      : [
          {
            type: "Page",
            title: "Review facility information",
            link: `/reports/${versionId}/facilities/${facilityId}/review-facility-information`,
            isActive: activeIndex === ActivePage.ReviewInformation,
          },
        ];
  return [
    ...backToFacilitiesLink,
    {
      type: "Section",
      title: `${name} information`,
      isExpanded: true,
      elements: [
        ...facilityItem,
        {
          type: "Section",
          title: "Activities information",
          isExpanded: isActivityListExpanded,
          elements: orderedActivities.map(
            (activity: ActivityData, index) =>
              ({
                type: "Page",
                title: activity.name,
                link: `/reports/${versionId}/facilities/${facilityId}/activities?activity_id=${activity.id}&step=${index}`,
              }) as TaskListElement,
          ),
        },
        {
          type: "Page",
          title: "Non-attributable emissions",
          isActive: activeIndex === ActivePage.NonAttributableEmission,
          link: `/reports/${versionId}/facilities/${facilityId}/non-attributable`,
        },
        {
          type: "Page",
          title: "Emissions summary",
          isActive: activeIndex === ActivePage.EmissionSummary,
          link: `/reports/${versionId}/facilities/${facilityId}/emission-summary`,
        },
        {
          type: "Page",
          title: "Production data",
          link: `/reports/${versionId}/facilities/${facilityId}/production-data`,
          isActive: activeIndex === ActivePage.ProductionData,
        },
        {
          type: "Page",
          title: "Allocation of emissions",
          isActive: activeIndex === ActivePage.AllocationOfEmissions,
          link: `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`,
        },
      ],
    },
  ];
};
