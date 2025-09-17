import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import ElicensingInvoicesPage from "@/compliance/src/app/components/elicensing-invoices/ElicensingInvoicesPage";

const title = "Compliance Administration";
export const metadata = generateMetadata(title);

function InvoicesWithNavigation({
  searchParams,
}: {
  searchParams?: DataGridSearchParams;
}) {
  return (
    <ComplianceNavigationPage activeTab={1}>
      <ElicensingInvoicesPage searchParams={searchParams || {}} />
    </ComplianceNavigationPage>
  );
}

export default defaultPageFactory(InvoicesWithNavigation);
