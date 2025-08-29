import { fetchPastReportsPageData } from "./fetchPastReportsPageData";
import PastReportsDataGrid from "./PastReportsDataGrid";
import { ReportRow, PastReportsSearchParams } from "./types";

export default async function PastReports({
  searchParams,
}: {
  searchParams: PastReportsSearchParams;
}) {
  const pastReports: { rows: ReportRow[]; row_count: number } =
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
