import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/contacts/ContactsHeader";
import Page from "@/administration/app/components/contacts/ContactsPage";

export default defaultPageFactory(Page, {
  fallback: <Loading />,
  header: Header,
});
