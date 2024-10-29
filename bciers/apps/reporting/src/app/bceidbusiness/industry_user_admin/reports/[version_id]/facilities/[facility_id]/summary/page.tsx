import { Suspense } from "react";
import FacilityEmissionSummaryData from "../../../../../../../components/facility/FacilityEmissionSummaryData";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback="Loading Schema">
        <FacilityEmissionSummaryData
          versionId={parseInt(router.params?.version_id)}
          facilityId={router.params?.facility_id}
        />
      </Suspense>
    </>
  );
}
