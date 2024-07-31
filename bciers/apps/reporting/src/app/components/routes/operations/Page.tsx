import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "../../operations/Operations";
import { OperationsSearchParams } from "../../operations/types";
import { getReportingDueDate } from "@reporting/src/app/utils/getReportingDueDate";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const reportingDueDate = await getReportingDueDate();
  const reportingYear = await getReportingYear();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reporting year {reportingYear}</h2>
        <h3 className="text-bc-text text-right">
          Reports due {reportingDueDate}
        </h3>
      </div>
      <Operations searchParams={searchParams} />
    </>
  );
}
