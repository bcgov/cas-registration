import InternalAccessRequestsPage from "@/administration/app/components/users/InternalAccessRequestsPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <InternalAccessRequestsPage />
    </Suspense>
  );
}
