import {
  HeaderStep,
  NavigationInformation,
  ReportingFlowDescription,
  ReportingPage,
} from "./types";
import { getFlow, reportingFlows } from "./reportingFlows";
import { pageElementFactory } from "./pageElementFactory";
import { headerElementFactory } from "./headerElementFactory";

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
  context: Object = {},
): Promise<NavigationInformation> {
  // get flow
  const flow = await getFlow(reportVersionId);

  // build tasklist from factories
  const flowData = reportingFlows[flow] as ReportingFlowDescription;
  const pages = flowData[step] as ReportingPage[];
  const tasklistPages = await Promise.all(
    pages.map(async (p) => {
      return pageElementFactory(p, page, reportVersionId, context);
    }),
  );
  const taskList = tasklistPages.map((tlp) => tlp.element);

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
    if (pageIndex != 0) backUrl = tasklistPages[pageIndex - 1].element.link;
    else {
      // last element of previous step
      const previousStepIndex = availableFlows.indexOf(step) - 1;
      if (previousStepIndex >= 0) {
        const previousStep = availableFlows[previousStepIndex];
        const lastPageOfPreviousStep = flowData[previousStep as HeaderStep]?.at(
          -1,
        ) as ReportingPage;
        backUrl = (
          await pageElementFactory(
            ReportingPage[lastPageOfPreviousStep],
            page,
            reportVersionId,
            context,
          )
        ).element.link;
      }
    }
  }

  let continueUrl = tasklistPages[pageIndex].continueUrl;

  if (continueUrl === undefined) {
    if (pageIndex != tasklistPages.length - 1)
      continueUrl = tasklistPages[pageIndex + 1].element.link;
    else {
      // first element of next step
      const nextStepIndex = availableFlows.indexOf(step) + 1;
      if (nextStepIndex < availableFlows.length) {
        const nextStep = availableFlows[nextStepIndex];
        const firstPageOfNextStep = flowData[nextStep as HeaderStep]?.at(
          0,
        ) as ReportingPage;

        continueUrl = (
          await pageElementFactory(
            ReportingPage[firstPageOfNextStep],
            page,
            reportVersionId,
            context,
          )
        ).element.link;
      }
    }
  }

  const rootElement = headerElementFactory(step);

  return {
    taskList: rootElement ? [{ ...rootElement, elements: taskList }] : taskList,
    backUrl: backUrl ?? "/reports",
    continueUrl: continueUrl ?? "/reports",
  };
}
