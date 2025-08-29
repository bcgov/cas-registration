import { ReportSearchParams } from "apps/reporting/src/app/components/operations/types";
import AnnualReports from "./annualReports";

export default async function AnnualReportsPage({
  searchParams,
}: {
  searchParams: ReportSearchParams;
}) {
  return <AnnualReports searchParams={searchParams} />;
}
