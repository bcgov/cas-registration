import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AccessRequests />
    </Suspense>
  );
}
