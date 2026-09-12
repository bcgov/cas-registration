import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import withReportComments from "@reporting/src/app/components/layout/withReportComments";
import Page from "@reporting/src/app/components/submitted/SubmittedPage";

export default defaultPageFactory(withReportComments(Page));
