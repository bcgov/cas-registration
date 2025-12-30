import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Header from "@/administration/app/components/contacts/ContactsHeader";
import Page from "@/administration/app/components/contacts/ContactsPage";

export default defaultPageFactory(Page, {
  header: Header,
  pageProps: { isExternalUser: true },
});
