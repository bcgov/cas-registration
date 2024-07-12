import { actionHandler } from "@bciers/actions";
import ReportingOperationDataGrid from "./ReportingOperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import buildQueryParams from "@bciers/utils/buildQueryParams";

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async (
  searchParams: OperationsSearchParams,
) => {
  const queryParams = buildQueryParams(searchParams);
  // fetch data from server
  const pageData = await actionHandler(
    `reporting/operations${queryParams}`,
    "GET",
    "",
  );
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};

// 🧩 Main component
export default async function Operations({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
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
