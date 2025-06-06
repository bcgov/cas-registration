import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import PaymentSummariesPage from "@/compliance/src/app/components/payment-summaries/PaymentSummariesPage";

const title = "Compliance Summaries";
export const metadata = generateMetadata(title);

function ComplianceSummariesWithNavigation({
  searchParams,
}: {
  searchParams?: DataGridSearchParams;
}) {
  return (
    <ComplianceNavigationPage activeTab={1}>
      <PaymentSummariesPage searchParams={searchParams || {}} />
    </ComplianceNavigationPage>
  );
}

export default defaultPageFactory(ComplianceSummariesWithNavigation);
