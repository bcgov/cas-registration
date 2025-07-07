import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";

const title = "Compliance Administration";
export const metadata = generateMetadata(title);

function ComplianceSummariesWithNavigation({
  searchParams,
}: {
  searchParams?: DataGridSearchParams;
}) {
  return (
    <ComplianceNavigationPage activeTab={0}>
      <ComplianceSummariesPage searchParams={searchParams || {}} />
    </ComplianceNavigationPage>
  );
}

export default defaultPageFactory(ComplianceSummariesWithNavigation);
