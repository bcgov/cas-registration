import { fetchPastReportsPageData } from "./fetchPastReportsPageData";
import PastReportsDataGrid from "./PastReportsDataGrid";
import { PastReportsRow, PastReportsSearchParams } from "./types";

export default async function PastReports({
  searchParams,
}: {
  searchParams: PastReportsSearchParams;
}) {
  const pastReports: { rows: PastReportsRow[]; row_count: number } =
    await fetchPastReportsPageData(searchParams);
  if (!pastReports) {
    return <div>No past reports data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <PastReportsDataGrid initialData={pastReports} />
    </div>
  );
}
