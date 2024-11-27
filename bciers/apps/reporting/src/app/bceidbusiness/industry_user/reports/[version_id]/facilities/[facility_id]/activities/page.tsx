import { Suspense } from "react";
import ActivityInit from "apps/reporting/src/app/components/activities/ActivityInit";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <ActivityInit
          versionId={parseInt(router.params?.version_id)}
          facilityId={router.params?.facility_id}
          activityId={parseInt(router.searchParams?.activity_id)}
          step={parseInt(router.searchParams?.step) || 0}
        />
      </Suspense>
    </>
  );
}
