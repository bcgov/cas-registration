import { fetchPastReportsPageData } from "./fetchPastReportsPageData";
import InternalPastReportsDataGrid from "./InternalPastReportsDataGrid";
import { ReportRow, ReportSearchParams } from "./types";

export default async function InternalPastReports({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  const pastReports: { rows: ReportRow[]; row_count: number } =
    await fetchPastReportsPageData(searchParams);
  if (!pastReports) {
    return <div>No past reports data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <InternalPastReportsDataGrid initialData={pastReports} />
    </div>
  );
}
