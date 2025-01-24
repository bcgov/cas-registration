// 🧩 Main component
import {
  FacilitiesSearchParams,
  FacilityRow,
} from "@reporting/src/app/components/operations/types";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/Facilities/FetchFacilitiesPageData";
import FacilitiesDataGrid from "@reporting/src/app/components/reportInformation/Facilities/FacilitiesDataGrid";

export default async function Facilities({
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
    <div className="mt-4">
      <FacilitiesDataGrid initialData={operations} />
    </div>
  );
}
