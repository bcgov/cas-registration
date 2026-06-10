import Link from "next/link";
import { fetchPastReportsPageData } from "./fetchPastReportsPageData";
import PastReportsDataGrid from "./PastReportsDataGrid";
import { ReportRow, ReportSearchParams } from "./types";

export default async function PastReportsPage({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  const pastReports: { rows: ReportRow[]; row_count: number } =
    await fetchPastReportsPageData(searchParams);

  const buttonStartReport = (
    <div className="flex w-full justify-end pb-6">
      <Link
        className="link-button-blue"
        href="../reports/previous-years/start-a-report"
      >
        Start a Report
      </Link>
    </div>
  );

  return (
    <div className="mt-5">
      {buttonStartReport}
      <PastReportsDataGrid initialData={pastReports} />
    </div>
  );
}
