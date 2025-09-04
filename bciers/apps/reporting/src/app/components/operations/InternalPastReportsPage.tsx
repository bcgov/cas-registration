import InternalPastReports from "./InternalPastReports";
import { ReportSearchParams } from "./types";

export default async function InternalPastReportsPage({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  return <InternalPastReports searchParams={searchParams} />;
}
