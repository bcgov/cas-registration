import { generateMetadata } from "@bciers/components/layout/RootLayout";
import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import DataGridBasePage from "@/registry/app/components/dashboard/DataGridBasePage";
import AccountsPage from "@/registry/app/components/dashboard/AccountsPage";
import type { DashboardSearchParams } from "@/registry/app/components/dashboard/types";
import type { Metadata } from "next";
import Loading from "@bciers/components/loading/SkeletonGrid";

const title = "BC Carbon Registry";
export const metadata: Metadata = generateMetadata(title);

function RegistryDashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  return (
    <DataGridBasePage activeTab={0}>
      <div className="flex flex-col">
        <AccountsPage searchParams={searchParams} />
      </div>
    </DataGridBasePage>
  );
}

export default defaultPageFactory(RegistryDashboardPage, {
  fallback: <Loading />
});