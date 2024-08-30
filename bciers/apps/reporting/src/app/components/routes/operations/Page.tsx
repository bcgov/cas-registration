import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "../../operations/Operations";
import { OperationsSearchParams } from "../../operations/types";
import dayjs from "dayjs";

const formatDate = (dateString: string | number | Date) => {
  return dayjs(dateString).format("MMM DD,YYYY");
};
export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const reportingYearObj = await getReportingYear();

  const reportDueDate = reportingYearObj?.report_due_date
    ? formatDate(reportingYearObj.report_due_date)
    : null;
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Reporting year {reportingYearObj.reporting_year}
        </h2>
        {reportDueDate && (
          <h3 className="text-bc-text text-right">
            Reports due {reportDueDate}
          </h3>
        )}
      </div>
      <Operations searchParams={searchParams} />
    </>
  );
}
