import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { FacilitiesSearchParams } from "./types";
import Facilities from "./Facilities";
import Note from "@bciers/components/layout/Note";
import getOperation from "@bciers/actions/api/getOperation";
import { validate as isValidUUID } from "uuid";
import { OperationTypes } from "@bciers/utils/enums";

export default async function FacilitiesPage({
  operationId,
  searchParams,
  isExternalUser,
}: Readonly<{
  operationId: string;
  searchParams: FacilitiesSearchParams;
  isExternalUser: boolean;
}>) {
  let operation;

  if (operationId && isValidUUID(operationId)) {
    operation = await getOperation(operationId);
    if (operation.error) {
      throw new Error(
        "We couldn't find your operation information. Please ensure you have been approved for access to this operation.",
      );
    }
  }

  return (
    <>
      <Note>
        <b>Note: </b>View the facilities of this operation here.
      </Note>
      <h2 className="text-bc-primary-blue">Facilities</h2>
      {/* Conditionally render the button based on user's role and operation type */}
      {isExternalUser && operation?.type !== OperationTypes.SFO && (
        <div className="text-right">
          <Link
            href={`/operations/${operationId}/facilities/add-facility?operations_title=${searchParams.operations_title}`}
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
