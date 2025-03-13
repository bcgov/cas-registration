import {
  HeaderStep,
  NavigationInformation,
  ReportingFlowDescription,
  ReportingPage,
  TaskListPageFactoryContext,
  TaskListPageFactoryData,
} from "./types";
import { getFlow, reportingFlows } from "./reportingFlows";
import { pageElementFactory } from "./pageElementFactory";
import { headerElementFactory } from "./headerElementFactory";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

/**
 * Utility function to get the link of a TaskListElement object.
 *
 * @param element the tasklist element for which the link needs to be found
 * @param firstOrLast if there are nested elements, use the link of the first or last one
 * @returns the link
 */
const getTasklistElementLink: (
  element: TaskListElement,
  firstOrLast?: "first" | "last",
) => string | undefined = (element, firstOrLast = "first") => {
  return (
    element.elements?.at(firstOrLast === "first" ? 0 : -1)?.link ?? element.link
  );
};

/**
 * Utility function to split tasklist page factory inputs depending on whether they should be
 * displayed in the top section of the tasklist.
 *
 * @param taskListFactoryDataItems a list of tasklist page factory inputs
 * @returns an array of length 2, containing:
 * - at the index 0, an array of the items to be displayed in the header
 * - at the index 1, an array of the items to be displayed regularly
 */
const splitHeaderElements = (
  taskListFactoryDataItems: TaskListPageFactoryData[],
) => {
  return [
    taskListFactoryDataItems.filter((i) => i.extraOptions?.taskListHeader),
    taskListFactoryDataItems.filter((i) => !i.extraOptions?.taskListHeader),
  ];
};

/**
 *
 * @param step
 * @param page
 * @param reportVersionId
 * @param context additional context to pass down to the individual page factories, if required.
 * @returns navigation information
 */

export async function getNavigationInformation(
  step: HeaderStep,
  page: ReportingPage,
  reportVersionId: number,
  facilityId: string,
  context: TaskListPageFactoryContext = {},
): Promise<NavigationInformation> {
  // get flow
  const flow = await getFlow(reportVersionId);

  // build tasklist from factories
  const flowData = reportingFlows[flow] as ReportingFlowDescription;

  if (!flowData) throw Error(`No reporting flow found for ${flow}`);

  const pages = flowData[step] as ReportingPage[];

  // build pages from the factories, skipping the ones
  const tasklistPages = (
    await Promise.all(
      pages.map(async (p) => {
        return pageElementFactory(
          p,
          page,
          reportVersionId,
          facilityId,
          context,
        );
      }),
    )
  ).filter((p) => !p.extraOptions?.skip);

  const [taskListHeaderPages, taskListNonHeaderPages] =
    splitHeaderElements(tasklistPages);
  const taskListHeaders = taskListHeaderPages.map((tlp) => tlp.element);
  const taskList = taskListNonHeaderPages.map((tlp) => tlp.element);

  const pageIndex = pages.indexOf(page);
  if (pageIndex === -1)
    // The current page wasn't found in the flow's step
    // We can't generate navigation links
    return {
      taskList: taskList,
      backUrl: "",
      continueUrl: "",
    };

  // find forward and back links
  // - either from the current page factory itself
  // - or from the next and previous in the list
  // - or from the next and previous taskListFactory
  const availableFlows = Object.keys(flowData);

  let backUrl = tasklistPages[pageIndex].backUrl;

  if (backUrl === undefined) {
    if (pageIndex != 0)
      backUrl = getTasklistElementLink(
        tasklistPages[pageIndex - 1].element,
        "last",
      );
    else {
      // last element of previous step
      const previousStepIndex = availableFlows.indexOf(step) - 1;
      if (previousStepIndex >= 0) {
        const previousStep = availableFlows[previousStepIndex];
        const lastPageOfPreviousStep = flowData[previousStep as HeaderStep]?.at(
          -1,
        ) as ReportingPage;

        const previousPage = await pageElementFactory(
          ReportingPage[lastPageOfPreviousStep],
          page,
          reportVersionId,
          facilityId,
          context,
        );
        backUrl = getTasklistElementLink(previousPage.element, "last");
      }
    }
  }

  let continueUrl = tasklistPages[pageIndex].continueUrl;

  if (continueUrl === undefined) {
    if (pageIndex != tasklistPages.length - 1) {
      continueUrl = getTasklistElementLink(
        tasklistPages[pageIndex + 1].element,
        "first",
      );
    } else {
      // first element of next step
      const nextStepIndex = availableFlows.indexOf(step) + 1;
      if (nextStepIndex < availableFlows.length) {
        const nextStep = availableFlows[nextStepIndex];
        const firstPageOfNextStep = flowData[nextStep as HeaderStep]?.at(
          0,
        ) as ReportingPage;

        const nextPage = await pageElementFactory(
          ReportingPage[firstPageOfNextStep],
          page,
          reportVersionId,
          facilityId,
          context,
        );
        continueUrl = getTasklistElementLink(nextPage.element, "first");
      }
    }
  }

  const rootElement = headerElementFactory(step, context);

  return {
    taskList: rootElement
      ? [...taskListHeaders, { ...rootElement, elements: taskList }]
      : [...taskListHeaders, ...taskList],
    backUrl: backUrl ?? "/reports",
    continueUrl: continueUrl ?? "/reports",
  };
}
