import { operationInformationPageFactories } from "./1_operationInformation";
import { facilitiesInformationPageFactories } from "./2_facilitiesInformation";
import { additionalInformationPageFactories } from "./3_additionalInformation";
import { complianceSummaryPageFactories } from "./4_complianceSummary";
import { signOffSubmitPageFactories } from "./5_signOffSubmit";
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
