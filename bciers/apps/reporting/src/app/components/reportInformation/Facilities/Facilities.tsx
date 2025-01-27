// 🧩 Main component
import { FacilityRow } from "@reporting/src/app/components/operations/types";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/Facilities/FetchFacilitiesPageData";
import FacilitiesDataGrid from "@reporting/src/app/components/reportInformation/Facilities/FacilitiesDataGrid";

export default async function Facilities({
  version_id,
}: {
  version_id: number;
}) {
  const facilities: {
    rows: FacilityRow[];
    row_count: number;
  } = await fetchFacilitiesPageData(version_id);
  if (!facilities) {
    return <div>No facilities available.</div>;
  }
  // Render the DataGrid component
  return (
    <div className="mt-4">
      <FacilitiesDataGrid initialData={facilities} />
    </div>
  );
}
