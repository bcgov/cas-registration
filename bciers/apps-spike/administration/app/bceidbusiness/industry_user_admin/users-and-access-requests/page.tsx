import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Header from "@/administration/app/components/userOperators/AccessRequestsHeader";
import Page from "@/administration/app/components/userOperators/AccessRequestsPage";

export default defaultPageFactory(Page, {
  header: Header,
});
