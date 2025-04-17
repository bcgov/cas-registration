import { ReportingPage, TaskListPageFactory } from "../types";

export const eioInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.ElectricityImportData]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Electricity import data",
      isActive: activePage === ReportingPage.ElectricityImportData,
      link: `/reports/${reportVersionId}/electricity-import-data`,
    },
  }),
};
