import { FacilityRow, FacilitiesSearchParams } from "./types";
import FacilityDataGrid from "./FacilityDataGrid";
import fetchFacilitiesPageData from "./fetchFacilitiesPageData";

// 🧩 Main component
export default async function Facilities({
  operationId,
  searchParams,
}: Readonly<{
  operationId: string;
  searchParams: FacilitiesSearchParams;
}>) {
  const facilities: {
    rows: FacilityRow[];
    row_count: number;
  } = await fetchFacilitiesPageData(operationId, searchParams);

  if (!facilities) {
    return <div>No facilities data in database.</div>;
  }

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <FacilityDataGrid operationId={operationId} initialData={facilities} />
    </div>
  );
}
