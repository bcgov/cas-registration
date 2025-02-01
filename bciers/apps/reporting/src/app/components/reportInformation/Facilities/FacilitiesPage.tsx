import Facilities from "@reporting/src/app/components/reportInformation/Facilities/Facilities";
import { FacilityReportSearchParams } from "@reporting/src/app/components/reportInformation/Facilities/types";

export default async function FacilitiesPage({
  version_id,
  searchParams,
}: {
  version_id: number;
  searchParams: FacilityReportSearchParams;
}) {
  return (
    <>
      <Facilities searchParams={searchParams} version_id={version_id} />
    </>
  );
}
