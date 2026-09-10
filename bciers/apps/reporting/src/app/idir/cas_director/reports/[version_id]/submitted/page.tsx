import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Page from "@reporting/src/app/components/submitted/SubmittedPage";
import withReportComments from "@reporting/src/app/components/layout/withReportComments";

export default defaultPageFactory(withReportComments(Page));
