import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { generateMetadata } from "@bciers/components/layout/RootLayout";
import { DataGridSearchParams } from "@/compliance/src/app/types";
import ComplianceSummariesPage from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesPage";
import AlertNote from "@bciers/components/form/components/AlertNote";

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
        <div className="mb-5">
          <div className="mb-2">
            <AlertNote>
              Your compliance obligation for the 2024 reporting year is{" "}
              <strong>due on November 30, 2025</strong>. Please pay five
              business days in advance to account for the processing time.
            </AlertNote>
          </div>
          <AlertNote>
            An automatic overdue penalty has been incurred and{" "}
            <strong>accrues at 0.38% daily</strong> since the compliance
            obligation was not paid by its due date. You may pay the penalty
            after the compliance obligation is paid.
          </AlertNote>
        </div>
        <ComplianceSummariesPage searchParams={searchParams || {}} />
      </div>
    </ComplianceNavigationPage>
  );
}

export default defaultPageFactory(ComplianceSummariesWithNavigation);
