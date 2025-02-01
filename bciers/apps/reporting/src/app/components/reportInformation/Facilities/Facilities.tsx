// 🧩 Main component
import { FacilityRow } from "@reporting/src/app/components/operations/types";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/Facilities/FetchFacilitiesPageData";
import FacilitiesDataGrid from "@reporting/src/app/components/reportInformation/Facilities/FacilitiesDataGrid";
import { FacilityReportSearchParams } from "@reporting/src/app/components/reportInformation/Facilities/types";

export default async function Facilities({
  version_id,
  searchParams,
}: {
  version_id: number;
  searchParams: FacilityReportSearchParams;
}) {
  const facilities: {
    rows: FacilityRow[];
    row_count: number;
  } = await fetchFacilitiesPageData({ version_id, searchParams });
  if (!facilities) {
    return <div>No facilities available.</div>;
  }
  return (
    <div className="mt-4">
      <FacilitiesDataGrid initialData={facilities} version_id={version_id} />
    </div>
  );
}
