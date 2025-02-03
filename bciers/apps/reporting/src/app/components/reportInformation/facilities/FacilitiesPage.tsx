// 🧩 Main component
import { FacilityRow } from "@reporting/src/app/components/reportInformation/facilities/types";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";
import FacilitiesDataGrid from "@reporting/src/app/components/reportInformation/facilities/FacilitiesDataGrid";
import { FacilityReportSearchParams } from "@reporting/src/app/components/reportInformation/facilities/types";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";

export default async function FacilitiesPage({
  version_id,
  searchParams,
}: HasReportVersion & { searchParams: FacilityReportSearchParams }) {
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
