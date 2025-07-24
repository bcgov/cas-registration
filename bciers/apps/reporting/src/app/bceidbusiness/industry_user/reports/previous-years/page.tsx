import { generateMetadata } from "@bciers/components/layout/RootLayout";
import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import PastReportsPage from "@reporting/src/app/components/operations/PastReportsPage";
import ReportsBasePage from "@reporting/src/app/components/operations/ReportsBasePage";
import { PastReportsSearchParams } from "@reporting/src/app/components/operations/types";

const title = "Reports";
export const metadata = generateMetadata(title);

function ReportsPage({
  searchParams,
}: {
  searchParams: PastReportsSearchParams;
}) {
  return (
    <ReportsBasePage activeTab={1}>
      <div className="flex flex-col">
        <PastReportsPage searchParams={searchParams || {}} />
      </div>
    </ReportsBasePage>
  );
}
export default defaultPageFactory(ReportsPage);
