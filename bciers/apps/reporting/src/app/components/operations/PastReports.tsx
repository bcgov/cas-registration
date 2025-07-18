import { fetchPastReportsPageData } from "./fetchPastReportsPageData";
import PastReportsDataGrid from "./PastReportsDataGrid";
import { PastReportsRow, OperationsSearchParams } from "./types";

export default async function PastReports({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const pastReports: { rows: PastReportsRow[]; row_count: number } =
    await fetchPastReportsPageData(searchParams);
  if (!pastReports) {
    return <div>No past reports data in database.</div>;
  }
  // Render the DataGrid component
  console.log("Past reports data fetched:", pastReports);
  return (
    <div className="mt-5">
      <PastReportsDataGrid initialData={pastReports} />
    </div>
  );
}
