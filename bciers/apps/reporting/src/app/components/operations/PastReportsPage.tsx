import PastReports from "./PastReports";
import { PastReportsSearchParams } from "./types";

export default async function PastReportsPage({
  searchParams,
}: {
  searchParams: PastReportsSearchParams;
}) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Past Reports</h2>
      </div>
      <PastReports searchParams={searchParams} />
    </>
  );
}
