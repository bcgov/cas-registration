import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Operations from "../../operations/Operations";
import { OperationsSearchParams } from "../../operations/types";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const reportingYear = await getReportingYear();

  return (
    <>
      <h2 className="text-2xl font-bold">Reporting year {reportingYear}</h2>
      <Operations searchParams={searchParams} />
    </>
  );
}
