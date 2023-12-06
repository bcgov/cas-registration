import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";

export default function Page() {
  return (
    <>
      <p>
        Note: Once “Approved”, the user will have access to their operator
        dashboard with full admin permissions, and can grant access and
        designate permissions to other Business BCeID holders there.
      </p>
      {/* <Link href="/dashboard/operations/create">
        <Button variant="contained">Add Operation</Button>
      </Link> */}
      <Suspense fallback={<Loading />}>
        <AccessRequests />
      </Suspense>
    </>
  );
}
