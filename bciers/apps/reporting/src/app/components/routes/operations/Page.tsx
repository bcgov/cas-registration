// 🚩 flagging: the shared page route for */operations
import Link from "next/link";
import { Button } from "@mui/material";
import { auth } from "@/dashboard/auth";
import Note, {
  registrationRequestNote,
} from "@bciers/components/datagrid/Note";
import Operations from "@reporting/src/app/components/operations/Operations";

export default async function OperationsPage({}) {
  // 👤 Use NextAuth.js hook to get information about the user's session
  /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
   * getServerSession requires passing the same object you would pass to NextAuth
   */
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
      <Operations />
    </>
  );
}
