import Operations from "../../operations/Operations";
import { OperationsSearchParams } from "../../operations/types";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <>
      <Operations searchParams={searchParams} />
    </>
  );
}
