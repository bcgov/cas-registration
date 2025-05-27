import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { ComplianceSummariesSearchParams } from "@/compliance/src/app/components/compliance-summaries/types";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";

const title = "Compliance Summaries";
export const metadata = generateMetadata(title);

function ComplianceSummariesWithNavigation({
  searchParams,
}: {
  searchParams?: ComplianceSummariesSearchParams;
}) {
  return (
    <ComplianceNavigationPage activeTab={0}>
      <ComplianceSummariesPage searchParams={searchParams || {}} />
    </ComplianceNavigationPage>
  );
}

export default defaultPageFactory(ComplianceSummariesWithNavigation);
