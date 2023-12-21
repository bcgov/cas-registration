import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";
import Note from "@/app/components/datagrid/Note";

export default function Page() {
  return (
    <>
      <Note
        message="Once “Approved”, the user will have access to their
        operator dashboard with full admin permissions, and can grant access and
        designate permissions to other Business BCeID holders there."
      />
      <Suspense fallback={<Loading />}>
        <AccessRequests />
      </Suspense>
    </>
  );
}
