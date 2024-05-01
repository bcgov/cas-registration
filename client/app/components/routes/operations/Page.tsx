// 🚩 flagging: the shared page route for */operations
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import { OperationsSearchParams } from "@/app/components/operations/types";
import Note, { registrationRequestNote } from "@/app/components/datagrid/Note";
import Operations from "@/app/components/operations/Operations";
import { auth } from "@/auth";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  // 👤 Use NextAuth.js hook to get information about the user's session
  const session = await auth();
  const role = session?.user?.app_role;

  return (
    <>
      {/* Conditionally render the button based on user's role */}
      {role?.includes("industry_user") && (
        <Link href={"/dashboard/operations/create/1"}>
          <Button variant="contained">Add Operation</Button>
        </Link>
      )}
      {role && role.includes("cas") && (
        <Note classNames="mb-4 mt-6" message={registrationRequestNote} />
      )}
      <Suspense fallback={<Loading />}>
        <Operations searchParams={searchParams} />
      </Suspense>
    </>
  );
}
