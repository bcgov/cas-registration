import { FacilityRow, FacilitiesSearchParams } from "./types";
import FacilityDataGrid from "@/administration/app/components/facilities/FacilitiesDataGrid";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";

export default async function FacilitiesPage({
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

  return (
    <div className="mt-5">
      <FacilityDataGrid operationId={operationId} initialData={facilities} />
    </div>
  );
}
