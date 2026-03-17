import Operations from "apps/reporting/src/app/components/operations/Operations";
import { OperationsSearchParams } from "apps/reporting/src/app/components/operations/types";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return <Operations searchParams={searchParams} />;
}
