import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "../../operations/Operations";
import { OperationsSearchParams } from "../../operations/types";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const reportingYearObj = await getReportingYear();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        <h3 className="text-bc-text text-right">
          Reports due {reportingYearObj.report_due_date}
        </h3>
      </div>
      <Operations searchParams={searchParams} />
    </>
  );
}
