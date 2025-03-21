import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import InternalAccessRequests from "./InternalAccessRequests";

export default function InternalAccessRequestsPage() {
  return (
    <>
      <h2 className="text-bc-primary-blue mb-4 mt-5">Users</h2>
      <Suspense fallback={<Loading />}>
        <InternalAccessRequests />
      </Suspense>
    </>
  );
}
