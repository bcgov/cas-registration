import { actionHandler } from "@bciers/actions";
import ReportingOperationDataGrid from "./ReportingOperationDataGrid";
import { OperationRow } from "./types";

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async () => {
  // fetch data from server
  const pageData = await actionHandler(`reporting/operations`, "GET", "");
  console.log(pageData);
  return {
    rows: pageData.items,
    row_count: pageData.count,
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
