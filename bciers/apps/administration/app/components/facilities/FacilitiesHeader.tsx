// FacilitiesHeader.tsx
import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import { Button } from "@mui/material";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { OperationTypes } from "@bciers/utils/src/enums";
import type { FacilitiesSearchParams } from "./types";

type Props = {
  operationId: string;
  searchParams: FacilitiesSearchParams;
  operation?: { type?: OperationTypes | string } | null;
};

export default async function FacilitiesHeader({
  operationId,
  searchParams,
  operation,
}: Props) {
  const role = await getSessionRole();
  const isExternalUser = !role.includes("cas_");

  const canAddFacility =
    isExternalUser && operation?.type !== OperationTypes.SFO;

  return (
    <>
      <Note>
        <b>Note: </b>View the facilities of this operation here.
      </Note>

      <h2 className="text-bc-primary-blue">Facilities</h2>

      {canAddFacility ? (
        <div className="text-right">
          <Link
            href={`/operations/${operationId}/facilities/add-facility?operations_title=${searchParams.operations_title ?? ""}`}
          >
            <Button variant="contained">Add Facility</Button>
          </Link>
        </div>
      ) : null}
    </>
  );
}
