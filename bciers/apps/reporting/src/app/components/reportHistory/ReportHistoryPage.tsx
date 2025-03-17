import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { OperationsSearchParams } from "apps/reporting/src/app/components/operations/types";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { OperationRow } from "@reporting/src/app/components/reportHistory/types";
import { fetchReportHistoryPageData } from "@reporting/src/app/components/reportHistory/fetchReportHistoryPageData";
import ReportHistoryDataGrid from "@reporting/src/app/components/reportHistory/ReportHistoryDataGrid";

export default async function ReportHistoryPage({
  report_id,
  searchParams,
}: {
  report_id: number;
  searchParams: OperationsSearchParams;
}) {
  const reportingYearObj = await getReportingYear();
  console.log("report_id", report_id);
  const reportDueDate = formatDate(
    reportingYearObj.report_due_date,
    "MMM DD,YYYY",
  );

  const history: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchReportHistoryPageData({ report_id, searchParams });
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        <h3 className="text-bc-text text-right">Reports due {reportDueDate}</h3>
      </div>
      <div className="mt-5">
        <ReportHistoryDataGrid report_id={report_id} initialData={history} />
      </div>
    </>
  );
}
