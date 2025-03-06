import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  HeaderStep,
  NavigationInformation,
  ReportingFlow,
  ReportingFlowDescription,
  ReportingPage,
  TaskListPageFactory,
} from "./types";

const sfoFlow: ReportingFlowDescription = {
  [HeaderStep.OperationInformation]: [
    ReportingPage.ReviewOperatorInfo,
    ReportingPage.PersonResponsible,
  ],
  [HeaderStep.ReportInformation]: [
    ReportingPage.Activities,
    ReportingPage.NonAttributableEmission,
    ReportingPage.EmissionSummary,
    ReportingPage.ProductionData,
    ReportingPage.AllocationOfEmissions,
  ],
  [HeaderStep.AdditionalInformation]: [ReportingPage.AdditionalReportingData],
  [HeaderStep.ComplianceSummary]: [ReportingPage.ComplianceSummary],
  [HeaderStep.SignOffSubmit]: [
    ReportingPage.FinalReview,
    ReportingPage.Verification,
    ReportingPage.Attachments,
    ReportingPage.SignOff,
  ],
};

export const flows: {
  [Flow in ReportingFlow]?: ReportingFlowDescription;
} = {
  [ReportingFlow.SFO]: sfoFlow,
  // More to come
};

const pageFactories: { [Page in ReportingPage]?: TaskListPageFactory } = {
  [ReportingPage.ReviewOperatorInfo]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Review operation information",
      link: `/reports/${reportVersionId}/review-operator-data`,
      isActive: activePage === ReportingPage.ReviewOperatorInfo,
    },
  }),
  [ReportingPage.PersonResponsible]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Person responsible",
      link: `/reports/${reportVersionId}/person-responsible`,
      isActive: activePage === ReportingPage.PersonResponsible,
    },
  }),
};
const notImplementedPageFactory: TaskListPageFactory = (activePage) => {
  throw new Error(`Tasklist page factory not implemented for ${activePage}`);
};

const pageFactory = (
  page: ReportingPage,
  activePage: ReportingPage,
  reportVersionId: number,
) => {
  const factory = pageFactories[page] ?? notImplementedPageFactory;

  return factory(activePage, reportVersionId);
};

const headerStepFactories: { [Step in HeaderStep]?: TaskListElement } = {
  [HeaderStep.OperationInformation]: {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
  },
};

export function taskListFactory(
  flow: ReportingFlow,
  step: HeaderStep,
  page: ReportingPage,
  report_version_id: number,
): NavigationInformation {
  // build tasklist from factories
  const flowData = flows[flow] as ReportingFlowDescription;
  const pages = flowData[step] as ReportingPage[];

  const tasklistPages = pages.map((p) =>
    pageFactory(p, page, report_version_id),
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
        backUrl = pageFactory(lastPageOfPreviousStep, page, report_version_id)
          .element.link;
      }
    }
  }

  let continueUrl = tasklistPages[pageIndex].continueUrl;

  if (continueUrl === undefined) {
    if (pageIndex != tasklistPages.length - 2)
      continueUrl = tasklistPages[pageIndex + 1].element.link;
    else {
      // first element of next step
      const nextStepIndex = Object.keys(flow).indexOf(step) + 1;
      if (nextStepIndex < availableFlows.length) {
        const nextStep = Object.keys(flow)[nextStepIndex];
        const firstPageOfNextStep = flowData[nextStep as HeaderStep]?.at(
          0,
        ) as ReportingPage;
        continueUrl = pageFactory(firstPageOfNextStep, page, report_version_id)
          .element.link;
      }
    }
  }

  return {
    taskList: taskList,
    backUrl: backUrl ?? "/reports",
    continueUrl: continueUrl ?? "/reports",
  };
}
