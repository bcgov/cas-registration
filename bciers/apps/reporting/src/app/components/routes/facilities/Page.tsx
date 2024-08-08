import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Facilities from "../../facilities/facilities";
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
      <Facilities searchParams={searchParams} />
    </>
  );
}
