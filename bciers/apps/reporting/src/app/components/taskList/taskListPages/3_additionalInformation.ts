import { ReportingPage, TaskListPageFactory } from "../types";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { OperationTypes } from "@bciers/utils/src/enums";

export const additionalInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.AdditionalReportingData]: async (
    activePage,
    reportVersionId,
  ) => {
    const reportOperation = await getReportingOperation(reportVersionId);
    const operationType = reportOperation?.operation_type;
    const backUrl =
      operationType === OperationTypes.LFO
        ? `/reports/${reportVersionId}/facilities/report-information`
        : undefined;

    return {
      element: {
        type: "Page",
        title: "Additional reporting data",
        link: `/reports/${reportVersionId}/additional-reporting-data`,
        isActive: activePage === ReportingPage.AdditionalReportingData,
      },
      backUrl,
    };
  },
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
