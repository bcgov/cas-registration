import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Operations from "@/app/components/routes/operations/Operations";
import Loading from "@/app/components/loading/SkeletonGrid";
import { actionHandler, getToken } from "@/app/utils/actions";

export default async function OperationsPage() {
  // 🚀 API call: Get operator id associated with this user_guid
  const response = await actionHandler(
    `registration/user-operator-id`,
    "GET",
    "",
  );
  const operator_id = response?.operator_id ?? "";

  return (
    <>
      <h1>Operations List</h1>
      {/* Conditionally render the button only if operator_id is an integer */}
      {typeof operator_id === "number" && Number.isInteger(operator_id) && (
        <Link href={`/dashboard/operations/${operator_id}/1`}>
          <Button variant="contained">Add Operation</Button>
        </Link>
      )}
      <Suspense fallback={<Loading />}>
        <Operations />
      </Suspense>
    </>
  );
}
