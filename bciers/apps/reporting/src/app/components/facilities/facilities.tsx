import { actionHandler } from "@bciers/actions";
import { FacilityRow, FacilitiesSearchParams } from "./types";
import buildQueryParams from "@bciers/utils/buildQueryParams";
import ReportingFacilityDataGrid from "./ReportingFacilityDataGrid";

// 🛠️ Function to fetch operations
export const fetchFacilitiesPageData = async (
  searchParams: FacilitiesSearchParams,
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
  searchParams: FacilitiesSearchParams;
}) {
  // Fetch operations data
  const operations: {
    rows: FacilityRow[];
    row_count: number;
  } = await fetchFacilitiesPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-5">
      <ReportingFacilityDataGrid initialData={operations} />
    </div>
  );
}
