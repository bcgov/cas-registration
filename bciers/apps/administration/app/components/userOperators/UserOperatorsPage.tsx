import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperatorDataGrid from "@/administration/app/components/userOperators/UserOperatorDataGrid";
import { UserOperatorDataGridRow } from "@/administration/app/components/userOperators/types";
import { processAccessRequestData } from "@/administration/app/components/userOperators/getAccessRequests";

// 🧩 Main component
export default async function UserOperatorsPage() {
  const userOperatorData: { rows: UserOperatorDataGridRow[] } =
    await processAccessRequestData();

  if (!userOperatorData) {
    return <div>No contacts data in database.</div>;
  }

  // Render the DataGrid component
  return (
    <>
      <Note>
        <b>Note: </b>View the users or access requests to your operator here.
      </Note>
      <h2 className="text-bc-primary-blue mb-1">Users and Access Requests</h2>
      <p className="m-0">
        Administrator role can: 1. View and edit all module, and 2. approve of
        access requests
      </p>
      <p className="m-0">Reporter role can: 1. View and edit all modules</p>
      <div className="text-right mb-6">
        <Link href={"#TBD"}>
          <Button variant="contained" sx={{ textTransform: "initial" }}>
            Invite a new user
          </Button>
        </Link>
      </div>
      <Suspense fallback={<Loading />}>
        <UserOperatorDataGrid initialData={userOperatorData} />
      </Suspense>
    </>
  );
}
