import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";

export default function Page() {
  return (
    <>
      <p>
        <b>Note:</b> Once “Approved”, the user will have access to their
        operator dashboard with full admin permissions, and can grant access and
        designate permissions to other Business BCeID holders there.
      </p>
      <Suspense fallback={<Loading />}>
        <AccessRequests />
      </Suspense>
    </>
  );
}
