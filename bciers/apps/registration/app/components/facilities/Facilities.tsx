import buildQueryParams from "@/app/utils/buildQueryParams";
import { actionHandler } from "@/app/utils/actions";
import { FacilityRow, FacilitiesSearchParams } from "./types";
import FacilityDataGrid from "./FacilityDataGrid";

// ↓ fetch data from server
export const fetchFacilitiesPageData = async (
  operationId: string,
  searchParams: FacilitiesSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(searchParams);
    const pageData = await actionHandler(
      `registration/operations/${operationId}/facilities${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: pageData.items,
      row_count: pageData.count,
    };
  } catch (error) {
    throw error;
  }
};

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
      <FacilityDataGrid initialData={facilities} />
    </div>
  );
}
