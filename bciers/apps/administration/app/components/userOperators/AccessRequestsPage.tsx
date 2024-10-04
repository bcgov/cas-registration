import Note from "@bciers/components/layout/Note";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import AccessRequestDataGrid from "@/administration/app/components/userOperators/AccessRequestDataGrid";
import { AccessRequestDataGridRow } from "@/administration/app/components/userOperators/types";
import { processAccessRequestData } from "@/administration/app/components/userOperators/getAccessRequests";

// 🧩 Main component
export default async function AccessRequestsPage() {
  const accessRequestData: { rows: AccessRequestDataGridRow[] } =
    await processAccessRequestData();

  return (
    <>
      <Note>
        <b>Note: </b>View the users or access requests to your operator here.
      </Note>
      <h2 className="text-bc-primary-blue mb-0">Users and Access Requests</h2>
      <div className="flex items-baseline gap-1">
        <h4 className="mb-0 mt-1">Administrator role Access:</h4>
        <span>View and edit all modules, approve of access requests</span>
      </div>
      <div className="flex items-baseline gap-1">
        <h4 className="mb-0 mt-2">Reporter role Access:</h4>
        <span className="mb-3">View and edit all modules</span>
      </div>
      <Suspense fallback={<Loading />}>
        <AccessRequestDataGrid initialData={accessRequestData} />
      </Suspense>
    </>
  );
}
