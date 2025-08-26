import { generateMetadata } from "@bciers/components/layout/RootLayout";
import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import AnnualReportsPage from "@reporting/src/app/components/operations/annualReportsPage";
import ReportsBasePage from "@reporting/src/app/components/operations/ReportsBasePage";
import { OperationsSearchParams } from "@reporting/src/app/components/operations/types";

const title = "Reports";
export const metadata = generateMetadata(title);

function ReportsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <ReportsBasePage activeTab={0}>
      <div className="flex flex-col">
        <AnnualReportsPage searchParams={searchParams || {}} />
      </div>
    </ReportsBasePage>
  );
}
export default defaultPageFactory(ReportsPage);
