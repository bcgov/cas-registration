import { Suspense } from "react";
import ActivityInit from "apps/reporting/src/app/components/activities/ActivityInit";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <ActivityInit
          versionId={parseInt((await router.params)?.version_id)}
          facilityId={(await router.params)?.facility_id}
          activityId={parseInt((await router.searchParams)?.activity_id)}
          step={parseInt((await router.searchParams)?.step) || 0}
        />
      </Suspense>
    </>
  );
}
