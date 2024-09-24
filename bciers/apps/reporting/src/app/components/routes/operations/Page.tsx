import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "../../operations/Operations";
import { OperationsSearchParams } from "../../operations/types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

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
      <Operations searchParams={searchParams} />
    </>
  );
}
