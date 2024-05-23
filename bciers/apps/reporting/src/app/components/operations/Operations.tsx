import { actionHandler } from "@/app/utils/actions";
import { OperationRow } from "@reporting/src/app/components/operations/types";
import ReportingOperationDataGrid from "./ReportingOperationDataGrid";
 
// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async () => {
  // fetch data from server
  const pageData = await actionHandler(`registration/operations`, "GET", "");
  return {
    rows: pageData.data,
    row_count: pageData.row_count,
  };
};
 
// 🧩 Main component
export default async function Operations() {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData();
  if (!operations) {
    return <div>No operations data in database.</div>;
  }
 
  // Render the DataGrid component
  return (
<div className="mt-5">
<ReportingOperationDataGrid initialData={operations} />
</div>
  );
}
