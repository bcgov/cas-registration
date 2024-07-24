// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "../../../components/operations/types";
import OperationsPage from "../../../components/routes/operations/Page";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <OperationsPage searchParams={searchParams} />
  );
}
