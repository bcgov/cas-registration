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
  getFlowData,
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

  console.log("from page ", page);
  console.log("[getNavigationInformation] flow:", flow);

  // build tasklist from factories
  const flowData = reportingFlows[flow] as ReportingFlowDescription;

  console.log("[getNavigationInformation] flowData:", flowData);
  if (!flowData) throw Error(`No reporting flow found for ${flow}`);

  const headerSteps: HeaderStep[] = Object.keys(flowData) as HeaderStep[];

  console.log("[getNavigationInformation] context", context);
  console.log("[getNavigationInformation] original pages:", flowData[step]);

  // Original pages array from flowData
  const pages = [...(flowData[step] as ReportingPage[])]; // make a shallow copy

  // Build tasklistPages from the factories
  const tasklistPagesTemp = await Promise.all(
    pages.map(async (p) =>
      pageElementFactory(p, page, reportVersionId, facilityId, context),
    ),
  );

  console.log(
    "[getNavigationInformation] tasklistPagesTemp after factory calls:",
    tasklistPagesTemp,
  );

  // Remove corresponding pages where tasklistPagesTemp has extraOptions.skip === true
  for (let i = tasklistPagesTemp.length - 1; i >= 0; i--) {
    if (tasklistPagesTemp[i].extraOptions?.skip) {
      console.log(
        `[getNavigationInformation] removing page at index ${i} (${pages[i]}) due to skip flag`,
      );
      pages.splice(i, 1);
    }
  }
  console.log("[getNavigationInformation] filtered pages:", pages);

  // Filter tasklistPages when element has extraOptions.skip === true
  const tasklistPages = tasklistPagesTemp.filter((p) => {
    const keep = !p.extraOptions?.skip;
    if (!keep) {
      console.log(
        `[getNavigationInformation] filtering out tasklist page (${JSON.stringify(
          p.element,
          null,
          2,
        )})`,
      );
    }
    return keep;
  });
  console.log(
    "[getNavigationInformation] tasklistPages after filtering:",
    tasklistPages,
  );

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
          lastPageOfPreviousStep,
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
          firstPageOfNextStep,
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
    headerSteps: headerSteps,
    headerStepIndex: headerSteps.indexOf(step),
  };
}
