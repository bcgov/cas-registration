import AnnualReportsDataGrid from "./annualReportsDataGrid";
import { fetchAnnualReportsPageData } from "./fetchAnnualReportsPageData";
import { ReportRow, ReportSearchParams } from "./types";

export default async function PastReports({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  const reports: { rows: ReportRow[]; row_count: number } =
    await fetchAnnualReportsPageData(searchParams);
  if (!reports) {
    return <div>No reports data in database for the current year.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <AnnualReportsDataGrid initialData={reports} />
    </div>
  );
}
