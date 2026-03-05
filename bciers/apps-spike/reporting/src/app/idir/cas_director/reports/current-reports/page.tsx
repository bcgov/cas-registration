import { generateMetadata } from "@bciers/components/layout/RootLayout";
import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import AnnualReportsPage from "@reporting/src/app/components/operations/annualReportsPage";
import ReportsBasePage from "@reporting/src/app/components/operations/ReportsBasePage";
import { ReportSearchParams } from "@reporting/src/app/components/operations/types";
import type { Metadata } from "next";

const title = "Reports";
export const metadata: Metadata = generateMetadata(title);

function ReportsPage({ searchParams }: { searchParams: ReportSearchParams }) {
  return (
    <ReportsBasePage activeTab={0}>
      <div className="flex flex-col">
        <AnnualReportsPage searchParams={searchParams || {}} />
      </div>
    </ReportsBasePage>
  );
}
export default defaultPageFactory(ReportsPage);
