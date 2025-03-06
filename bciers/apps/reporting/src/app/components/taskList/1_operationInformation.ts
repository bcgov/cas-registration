import {
  AsyncTaskListPageFactory,
  ReportingPage,
  TaskListPageFactory,
} from "./types";
import { getFacilityReport } from "../../utils/getFacilityReport";

export const operationInformationPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory | AsyncTaskListPageFactory;
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

export const operationInformationHeaderStep = {
  type: "Section",
  title: "Operation information",
  isExpanded: true,
};
