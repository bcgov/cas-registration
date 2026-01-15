import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/operations/OperationsHeader";
import Page from "@/administration/app/components/operations/OperationsPage";

export default defaultPageFactory(Page, {
  fallback: <Loading />,
  header: Header,
});
