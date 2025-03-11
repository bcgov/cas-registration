import { ReportingPage, TaskListPageFactory } from "./types";

export const operationInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
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
  [ReportingPage.ReviewFacilities]: (activePage, reportVersionId) => ({
    element: {
      type: "Page",
      title: "Review facilities",
      link: `/reports/${reportVersionId}/facilities/review-facilities`,
      isActive: activePage === ReportingPage.ReviewFacilities,
    },
  }),
};

export const operationInformationHeaderStep = {
  type: "Section",
  title: "Operation information",
  isExpanded: true,
};
