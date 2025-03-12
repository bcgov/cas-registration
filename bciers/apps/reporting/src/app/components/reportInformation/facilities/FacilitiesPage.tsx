// 🧩 Main component
import { FacilityRow } from "@reporting/src/app/components/reportInformation/facilities/types";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";
import FacilitiesDataGrid from "@reporting/src/app/components/reportInformation/facilities/FacilitiesDataGrid";
import { FacilityReportSearchParams } from "@reporting/src/app/components/reportInformation/facilities/types";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getNavigationInformation } from "../../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../../taskList/types";

export default async function FacilitiesPage({
  version_id,
  searchParams,
}: HasReportVersion & { searchParams: FacilityReportSearchParams }) {
  const facilities: {
    rows: FacilityRow[];
    row_count: number;
    is_completed_count: number;
  } = await fetchFacilitiesPageData({ version_id, searchParams });
  if (!facilities) {
    return <div>No facilities available.</div>;
  }

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.FacilitiesTable,
    version_id,
    facilities.rows[0].id,
  );
  return (
    <div className="mt-4">
      <FacilitiesDataGrid
        initialData={facilities}
        version_id={version_id}
        navigationInformation={navInfo}
      />
    </div>
  );
}
