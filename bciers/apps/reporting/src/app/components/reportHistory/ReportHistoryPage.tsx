import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { OperationsSearchParams } from "apps/reporting/src/app/components/operations/types";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import ReportHistory from "@reporting/src/app/components/reportHistory/ReportHistory";

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
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        <h3 className="text-bc-text text-right">Reports due {reportDueDate}</h3>
      </div>
      <ReportHistory searchParams={searchParams} />
    </>
  );
}
