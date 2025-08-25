import PastReports from "./PastReports";
import { PastReportsSearchParams } from "./types";

export default async function PastReportsPage({
  searchParams,
}: {
  searchParams: PastReportsSearchParams;
}) {
  return <PastReports searchParams={searchParams} />;
}
