// 🚩 flagging: the shared page route for */operations
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { OperationsSearchParams } from "@/app/components/operations/types";
import Note, {
  registrationRequestNote,
} from "@bciers/components/datagrid/Note";
import Operations from "./Operations";
import { FrontEndRoles } from "@/app/utils/enums";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  // 👤 Use NextAuth.js hook to get information about the user's session
  /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
   * getServerSession requires passing the same object you would pass to NextAuth
   */
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const role = session?.user?.app_role;
  const message = role?.includes("cas")
    ? "View all the operations, which can be sorted or filtered by operator here."
    : "View the operations owned by your operator here.";

  return (
    <>
      <Note classNames="mb-4 mt-6" message={message} />
      <h1>Operations</h1>
      {/* Conditionally render the button based on user's role */}
      {role?.includes("industry_user") && (
        <Link href={"/dashboard/operations/create/1"}>
          <Button variant="contained">Add Operation</Button>
        </Link>
      )}

      <Suspense fallback={<Loading />}>
        <Operations searchParams={searchParams} role={role} />
      </Suspense>
    </>
  );
}
