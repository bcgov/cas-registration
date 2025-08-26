import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { ReportSearchParams } from "apps/reporting/src/app/components/operations/types";
import dayjs from "dayjs";
import AnnualReports from "./annualReports";

export default async function AnnualReportsPage({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  const reportingYearObj = await getReportingYear();
  const reportDueDate = reportingYearObj.report_due_date;
  const dueDateYearOnly = dayjs(reportDueDate).year();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        <h3 className="text-bc-text text-right">
          Reports due May 31, {dueDateYearOnly}
        </h3>
      </div>
      <AnnualReports searchParams={searchParams} />
    </>
  );
}
