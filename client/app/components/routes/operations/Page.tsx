// 🚩 flagging: the shared page route for */operations
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Operations from "@/app/components/routes/operations/Operations";
import Loading from "@/app/components/loading/SkeletonGrid";
import { Roles } from "@/app/utils/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Note, { registrationRequestNote } from "../../datagrid/Note";

export default async function OperationsPage() {
  // 👤 Use NextAuth.js hook to get information about the user's session
  /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
   * getServerSession requires passing the same object you would pass to NextAuth
   */
  const session = await getServerSession(authOptions);
  const role = session?.user?.app_role;

  return (
    <>
      <h1>Operations List</h1>
      {/* Conditionally render the button based on user's role */}
      {role === Roles.INDUSTRY_USER_ADMIN && (
        <Link href={"/dashboard/operations/create/1"}>
          <Button variant="contained">Add Operation</Button>
        </Link>
      )}
      {role && role.includes("cas") && (
        <Note message={registrationRequestNote} />
      )}
      <Suspense fallback={<Loading />}>
        <Operations />
      </Suspense>
    </>
  );
}
