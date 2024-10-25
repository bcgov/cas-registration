import { Suspense } from "react";
import FacilityEmissionSummary from "../../../../../../../components/facility/FacilityEmissionSummary";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback="Loading Schema">
        <FacilityEmissionSummary
          versionId={parseInt(router.params?.version_id)}
          facilityId={router.params?.facility_id}
        />
      </Suspense>
    </>
  );
}
