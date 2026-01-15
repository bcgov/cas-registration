import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/facilities/FacilitiesHeader";
import Page from "@/administration/app/components/facilities/FacilitiesPage";

export default defaultPageFactory(Page, {
  fallback: <Loading />,
  header: Header,
});
