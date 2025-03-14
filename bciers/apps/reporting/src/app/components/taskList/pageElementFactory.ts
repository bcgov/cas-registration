import { operationInformationPageFactories } from "./taskListPages/1_operationInformation";
import { facilitiesInformationPageFactories } from "./taskListPages/2_facilitiesInformation";
import { additionalInformationPageFactories } from "./taskListPages/3_additionalInformation";
import { complianceSummaryPageFactories } from "./taskListPages/4_complianceSummary";
import { signOffSubmitPageFactories } from "./taskListPages/5_signOffSubmit";
import {
  ReportingPage,
  TaskListPageFactory,
  TaskListPageFactoryContext,
} from "./types";

export const pageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  ...operationInformationPageFactories,
  ...facilitiesInformationPageFactories,
  ...additionalInformationPageFactories,
  ...complianceSummaryPageFactories,
  ...signOffSubmitPageFactories,
};

export const pageElementFactory = (
  page: ReportingPage,
  activePage: ReportingPage,
  reportVersionId: number,
  facilityId: string,
  context?: TaskListPageFactoryContext,
) => {
  const factory = pageFactories[page];

  if (!factory)
    throw new Error(`Tasklist page factory not implemented for ${page}`);

  return factory(activePage, reportVersionId, facilityId, context);
};
