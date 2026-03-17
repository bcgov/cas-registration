import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/users/InternalAccessRequestsHeader";
import Page from "@/administration/app/components/users/InternalAccessRequestsPage";

export default function InternalAccessRequestsPageFactory() {
  return defaultPageFactory(Page, {
    fallback: <Loading />,
    header: Header,
  });
}
