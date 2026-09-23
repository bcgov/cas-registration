import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/registry/app/components/dashboard/DashboardHeader";
import Page from "@/registry/app/components/dashboard/DashboardPage";

export default function RegistryDashboardPageFactory() {
  return defaultPageFactory(Page, {
    fallback: <Loading />,
    header: Header,
  });
}