import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "apps/reporting/src/app/components/operations/Operations";
import {
  OperationRow,
  OperationsSearchParams,
} from "apps/reporting/src/app/components/operations/types";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { fetchOperationsPageData } from "@reporting/src/app/components/operations/fetchOperationsPageData";
import OperationsDataGrid from "@reporting/src/app/components/operations/OperationsDataGrid";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const reportingYearObj = await getReportingYear();

  const reportDueDate = formatDate(
    reportingYearObj.report_due_date,
    "MMM DD,YYYY",
  );

  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);

  if (!operations) {
    return <div>No operations data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        <h3 className="text-bc-text text-right">Reports due {reportDueDate}</h3>
      </div>
      <div className="mt-5">
        <OperationsDataGrid initialData={operations} />
      </div>
    </>
  );
}
