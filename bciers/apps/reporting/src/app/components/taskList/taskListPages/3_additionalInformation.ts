import { ReportingPage, TaskListPageFactory } from "../types";

export const additionalInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.AdditionalReportingData]: (
    activePage,
    reportVersionId,
    _,
    context,
  ) => ({
    element: {
      type: "Page",
      title: "Additional reporting data",
      link: `/reports/${reportVersionId}/additional-reporting-data`,
      isActive: activePage === ReportingPage.AdditionalReportingData,
    },
    backUrl: context?.returnToFacilitiesTable
      ? `/reports/${reportVersionId}/facilities/report-information`
      : undefined,
  }),
  [ReportingPage.NewEntrantInformation]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "New entrant information",
      isActive: activePage === ReportingPage.NewEntrantInformation,
      link: `/reports/${reportVersionId}/new-entrant-information`,
    },
  }),
  [ReportingPage.OperationEmissionSummary]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Operation emission summary",
      isActive: activePage === ReportingPage.OperationEmissionSummary,
      link: `/reports/${reportVersionId}/operation-emission-summary`,
    },
  }),
};
