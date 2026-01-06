import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/registration/app/components/transfers/TransfersHeader";
import Page from "@/registration/app/components/transfers/TransfersPage";

export default defaultPageFactory(Page, {
  fallback: <Loading />,
  header: Header,
});
