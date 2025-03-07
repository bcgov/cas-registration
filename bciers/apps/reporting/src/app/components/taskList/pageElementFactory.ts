import { getFacilityReport } from "../../utils/getFacilityReport";
import { operationInformationPageFactories } from "./1_operationInformation";
import {
  AsyncTaskListPageFactory,
  ReportingPage,
  TaskListPageFactory,
} from "./types";

export const pageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory | AsyncTaskListPageFactory;
} = {
  ...operationInformationPageFactories,
  [ReportingPage.Activities]: async (activePage, reportVersionId) => {
    const facilityReport = await getFacilityReport(reportVersionId);
    const facilityId = facilityReport.facility_id;
    return {
      element: {
        type: "Page",
        title: "Activities",
        link: `/reports/${reportVersionId}/facilities/${facilityId}/activities`,
        isActive: activePage === ReportingPage.Activities,
      },
    };
  },
};

export const pageElementFactory = (
  page: ReportingPage,
  activePage: ReportingPage,
  reportVersionId: number,
  context: Object = {},
) => {
  const factory = pageFactories[page];

  if (!factory)
    throw new Error(`Tasklist page factory not implemented for ${page}`);

  return factory(activePage, reportVersionId, context);
};
