import PastReports from "./PastReports";
import { ReportSearchParams } from "./types";

export default async function PastReportsPage({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  return <PastReports searchParams={searchParams} />;
}
