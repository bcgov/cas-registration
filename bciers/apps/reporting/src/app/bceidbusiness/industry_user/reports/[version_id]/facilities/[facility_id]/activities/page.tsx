import { Suspense } from "react";
import ActivityInit from "apps/reporting/src/app/components/activities/ActivityInit";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback="Loading Schema">
        <ActivityInit
          versionId={parseInt(router.params?.version_id)}
          facilityId={router.params?.facility_id}
          activityId={parseInt(router.searchParams?.activity_id)}
        />
      </Suspense>
    </>
  );
}
