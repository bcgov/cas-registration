import { ReportingPage, TaskListPageFactory } from "../types";

export const operationInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.ReviewOperationInfo]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Review operation information",
      link: `/reports/${reportVersionId}/review-operation-information`,
      isActive: activePage === ReportingPage.ReviewOperationInfo,
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
  [ReportingPage.ReviewFacilities]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Review facilities",
      link: `/reports/${reportVersionId}/facilities/review-facilities`,
      isActive: activePage === ReportingPage.ReviewFacilities,
    },
  }),
};
