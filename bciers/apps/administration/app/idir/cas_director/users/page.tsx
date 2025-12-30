import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Header from "@/administration/app/components/users/InternalAccessRequestsHeader";
import Page from "@/administration/app/components/users/InternalAccessRequestsPage";

export default defaultPageFactory(Page, {
  header: Header,
});
