import { auth } from "@/dashboard/auth";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { FacilitiesSearchParams } from "../../facilities/types";
import Facilities from "../../facilities/Facilities";
import Note from "@bciers/components/datagrid/Note";

export default async function FacilitiesPage({
  operationId,
  searchParams,
}: Readonly<{ operationId: string; searchParams: FacilitiesSearchParams }>) {
  // 👤 Use NextAuth.js hook to get information about the user's session
  /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
   */
  const session = await auth();
  const role = session?.user?.app_role;
  return (
    <>
      <Note
        classNames="mb-4 bg-gray-300 py-5"
        message={"View the facilities of this operation here."}
      />
      <h1>Facilities</h1>
      {/* Conditionally render the button based on user's role */}
      {role?.includes("industry_user") && (
        <div>
          <Link href="#">
            <Button variant="contained">Add Facility</Button>
          </Link>
        </div>
      )}

      <Suspense fallback={<Loading />}>
        <Facilities operationId={operationId} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
