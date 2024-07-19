// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "../../../components/operations/types";
import OperationsPage from "../../../components/routes/operations/Page";
import CurrentReportingYearContext from "@reporting/src/app/components/context/CurrentReportingYearContext";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <CurrentReportingYearContext.Provider value={2024}>
      <OperationsPage searchParams={searchParams} />
    </CurrentReportingYearContext.Provider>
  );
}
