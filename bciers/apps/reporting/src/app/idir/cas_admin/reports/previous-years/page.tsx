import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ReportsBasePage from "@reporting/src/app/components/operations/ReportsBasePage";

function ReportsPage() {
  return (
    <ReportsBasePage activeTab={1}>
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
          Previous Years Reports
        </h2>
        <p className="text-bc-text text-lg mb-2">
          This feature is <b>coming soon</b>.
        </p>
        <p className="text-bc-text text-center max-w-xl">
          You’ll be able to view reports from previous reporting years here.
        </p>
      </div>
    </ReportsBasePage>
  );
}

export default defaultPageFactory(ReportsPage);
