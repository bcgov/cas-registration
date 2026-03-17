import { FrontEndRoles } from "@bciers/utils/src/enums";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import Link from "next/link";
import { Button } from "@mui/material";

// Render the header component
export default async function TransfersHeader() {
  // To get the user's role from the session
  const role = await getSessionRole();
  const rolesAllowedToTransfer = [
    FrontEndRoles.CAS_ANALYST,
    FrontEndRoles.CAS_DIRECTOR,
  ];
  const isAllowedToTransfer = rolesAllowedToTransfer.includes(role);

  return (
    <>
      <div className="mt-5">
        <h2 className="text-bc-primary-blue">Transfers</h2>
        {isAllowedToTransfer && (
          <div className="text-right mb-4">
            <Link href={"/transfers/transfer-entity"}>
              {/* textTransform to remove uppercase text */}
              <Button variant="contained" sx={{ textTransform: "none" }}>
                Make a Transfer
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
