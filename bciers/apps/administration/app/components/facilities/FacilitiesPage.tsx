import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { FacilitiesSearchParams } from "./types";
import Facilities from "./Facilities";
import Note from "@bciers/components/layout/Note";

export default async function FacilitiesPage({
  operationId,
  searchParams,
  isExternalUser,
}: Readonly<{
  operationId: string;
  searchParams: FacilitiesSearchParams;
  isExternalUser: boolean;
}>) {
  return (
    <>
      <Note>
        <b>Note: </b>View the facilities of this operation here.
      </Note>
      <h2 className="text-bc-primary-blue">Facilities</h2>
      {/* Conditionally render the button based on user's role */}
      {isExternalUser && (
        <div className="text-right">
          <Link
<<<<<<< HEAD
            href={`/operations/${operationId}/facilities/add-facility?operationsTitle=${searchParams.operationsTitle}`}
=======
            href={`/operations/${operationId}/facilities/new?operationsTitle=${searchParams.operationsTitle}`}
>>>>>>> aa0d5fd4 (chore: vitest FacilityForm)
          >
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
