import {
  HeaderStep,
  NavigationInformation,
  ReportingFlowDescription,
  ReportingPage,
  TaskListPageFactoryContext,
  TaskListPageFactoryData,
} from "./types";
import { pageElementFactory } from "./taskListPages/pageElementFactory";
import { headerElementFactory } from "./headerElementFactory";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  getFlow,
  reportingFlows,
} from "@reporting/src/app/components/taskList/reportingFlows";

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

type pageElementFactoryContext = {
  page: ReportingPage;
  reportVersionId: number;
  facilityId: string;
  context: TaskListPageFactoryContext;
};

/**
 * Utility functions to find the back links for the tasklist.
 * - either from the current page factory itself
 * - or from the next and previous in the list
 * - or from the next and previous taskListFactory
 *
 */
const determineBackUrl = async (
  flowData: ReportingFlowDescription,
  tasklistPages: TaskListPageFactoryData[],
  pageIndex: number,
  step: HeaderStep,
  previousPageContext: pageElementFactoryContext,
) => {
  const availableFlows = Object.keys(flowData);
  const { page, reportVersionId, facilityId, context } = previousPageContext;

  const backUrl = tasklistPages[pageIndex].backUrl;

  if (backUrl !== undefined) {
    return backUrl;
  }

  if (pageIndex != 0)
    return getTasklistElementLink(tasklistPages[pageIndex - 1].element, "last");

  // last element of previous step
  const previousStepIndex = availableFlows.indexOf(step) - 1;
  if (previousStepIndex >= 0) {
    const previousStep = availableFlows[previousStepIndex];
    const lastPageOfPreviousStep = flowData[previousStep as HeaderStep]?.at(
      -1,
    ) as ReportingPage;

    const previousPage = await pageElementFactory(
      lastPageOfPreviousStep,
      page,
      reportVersionId,
      facilityId,
      context,
    );

    return getTasklistElementLink(previousPage.element, "last");
  }

  return backUrl;
};

const determineContinueUrl = async (
  flowData: ReportingFlowDescription,
  tasklistPages: TaskListPageFactoryData[],
  pageIndex: number,
  step: HeaderStep,
  nextPageContext: pageElementFactoryContext,
) => {
  const availableFlows = Object.keys(flowData);
  const { page, reportVersionId, facilityId, context } = nextPageContext;
  const continueUrl = tasklistPages[pageIndex].continueUrl;

  if (continueUrl !== undefined) {
    return continueUrl;
  }

  if (pageIndex != tasklistPages.length - 1) {
    return getTasklistElementLink(
      tasklistPages[pageIndex + 1].element,
      "first",
    );
  }
  // first element of next step
  const nextStepIndex = availableFlows.indexOf(step) + 1;
  if (nextStepIndex < availableFlows.length) {
    const nextStep = availableFlows[nextStepIndex];
    const firstPageOfNextStep = flowData[nextStep as HeaderStep]?.at(
      0,
    ) as ReportingPage;

    const nextPage = await pageElementFactory(
      firstPageOfNextStep,
      page,
      reportVersionId,
      facilityId,
      context,
    );
    return getTasklistElementLink(nextPage.element, "first");
  }
  return continueUrl;
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

  const headerSteps: HeaderStep[] = Object.keys(flowData) as HeaderStep[];

  // Original pages array from flowData
  const pages = [...(flowData[step] as ReportingPage[])]; // make a shallow copy

  // Build tasklistPages from the factories
  const tasklistPagesTemp = await Promise.all(
    pages.map(async (p) =>
      pageElementFactory(p, page, reportVersionId, facilityId, context),
    ),
  );

  // Remove corresponding pages where tasklistPagesTemp has extraOptions.skip === true
  for (let i = tasklistPagesTemp.length - 1; i >= 0; i--) {
    if (tasklistPagesTemp[i].extraOptions?.skip) {
      pages.splice(i, 1);
    }
  }

  // Filter tasklistPages when element has extraOptions.skip === true
  const tasklistPages = tasklistPagesTemp.filter((p) => {
    const keep = !p.extraOptions?.skip;

    return keep;
  });

  const [taskListHeaderPages, taskListNonHeaderPages] =
    splitHeaderElements(tasklistPages);
  const taskListHeaders = taskListHeaderPages.map((tlp) => tlp.element);
  const taskList = taskListNonHeaderPages.map((tlp) => tlp.element);

  const pageIndex = pages.indexOf(page);
  if (pageIndex === -1)
    // The current page wasn't found in the flow's step
    throw new Error(
      `Page ${page} was not found in this reporting flow, unable to generate the appropriate tasklist and navigation.`,
    );

  // find forward and back links
  const backUrl = await determineBackUrl(
    flowData,
    tasklistPages,
    pageIndex,
    step,
    { page, reportVersionId, facilityId, context },
  );

  const continueUrl = await determineContinueUrl(
    flowData,
    tasklistPages,
    pageIndex,
    step,
    { page, reportVersionId, facilityId, context },
  );

  const rootElement = headerElementFactory(step, context);

  return {
    taskList: rootElement
      ? [...taskListHeaders, { ...rootElement, elements: taskList }]
      : [...taskListHeaders, ...taskList],
    backUrl: backUrl ?? "/reports/current-reports",
    continueUrl: continueUrl ?? "/reports/current-reports",
    headerSteps: headerSteps,
    headerStepIndex: headerSteps.indexOf(step),
  };
}
