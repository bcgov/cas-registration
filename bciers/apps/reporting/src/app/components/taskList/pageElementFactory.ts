import { getFacilityReport } from "../../utils/getFacilityReport";
import { operationInformationPageFactories } from "./1_operationInformation";
import { facilitiesInformationPageFactories } from "./2_facilitiesInformation";
import { ReportingPage, TaskListPageFactory } from "./types";

export const pageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  ...operationInformationPageFactories,
  ...facilitiesInformationPageFactories,
};

export const pageElementFactory = (
  page: ReportingPage,
  activePage: ReportingPage,
  reportVersionId: number,
  facilityId: string,
  context: Object = {},
) => {
  const factory = pageFactories[page];

  if (!factory)
    throw new Error(`Tasklist page factory not implemented for ${page}`);

  return factory(activePage, reportVersionId, facilityId, context);
};
