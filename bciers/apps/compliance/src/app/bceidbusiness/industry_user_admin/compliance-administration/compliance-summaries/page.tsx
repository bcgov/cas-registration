import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";

const title = "Compliance Summaries";
export const metadata = generateMetadata(title);

function ComplianceSummariesWithNavigation({
  searchParams,
}: {
  searchParams?: DataGridSearchParams;
}) {
  return (
    <ComplianceNavigationPage activeTab={0}>
      <div className="flex flex-col">
        <ComplianceSummariesPage searchParams={searchParams || {}} />
      </div>
    </ComplianceNavigationPage>
  );
}

export default defaultPageFactory(ComplianceSummariesWithNavigation);
