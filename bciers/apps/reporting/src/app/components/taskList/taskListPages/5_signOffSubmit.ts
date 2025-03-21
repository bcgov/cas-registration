import { ReportingPage, TaskListPageFactory } from "../types";

export const signOffSubmitPageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  [ReportingPage.FinalReview]: (activePage, reportVersionId) => ({
    element: {
      type: "Page", // Set the type to "Page"
      title: "Final review",
      link: `/reports/${reportVersionId}/final-review`,
      isActive: activePage === ReportingPage.FinalReview,
    },
  }),
  [ReportingPage.Verification]: (activePage, reportVersionId, _, context) => {
    return {
      extraOptions: {
        skip: !!context?.skipVerification,
      },
      element: {
        type: "Page", // Set the type to "Page"
        title: "Verification",
        link: `/reports/${reportVersionId}/verification`,
        isActive: activePage === ReportingPage.Verification,
      },
    };
  },
  [ReportingPage.Attachments]: (activePage, reportVersionId) => ({
    element: {
      type: "Page", // Set the type to "Page"
      title: "Attachments",
      link: `/reports/${reportVersionId}/attachments`,
      isActive: activePage === ReportingPage.Attachments,
    },
  }),
  [ReportingPage.SignOff]: (activePage, reportVersionId) => ({
    element: {
      type: "Page", // Set the type to "Page"
      title: "Sign-off",
      link: `/reports/${reportVersionId}/sign-off`,
      isActive: activePage === ReportingPage.SignOff,
    },
    continueUrl: `/reports/${reportVersionId}/submission`,
  }),
};
