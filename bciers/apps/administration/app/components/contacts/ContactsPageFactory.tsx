import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/contacts/ContactsHeader";
import ContactsPage from "@/administration/app/components/contacts/ContactsPage";

type Options = {
  isExternalUser?: boolean;
};

export default function ContactsPageFactory(options?: Options) {
  return defaultPageFactory(ContactsPage, {
    fallback: <Loading />,
    header: Header,
    pageProps: { isExternalUser: options?.isExternalUser ?? false },
  });
}
