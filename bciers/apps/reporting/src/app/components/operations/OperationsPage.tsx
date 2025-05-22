import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "apps/reporting/src/app/components/operations/Operations";
import { OperationsSearchParams } from "apps/reporting/src/app/components/operations/types";
import dayjs from "dayjs";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const reportingYearObj = await getReportingYear();
  const reportDueDate = reportingYearObj.report_due_date;
  const yearOnly = dayjs(reportDueDate).year();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        <h3 className="text-bc-text text-right">
          Reports due May 31,{yearOnly}
        </h3>
      </div>
      <Operations searchParams={searchParams} />
    </>
  );
}
