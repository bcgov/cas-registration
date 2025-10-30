import TransferDataGrid from "./TransfersDataGrid";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { TransferRow, TransfersSearchParams } from "./types";
import fetchTransferEventsPageData from "./fetchTransferEventsPageData";
import Link from "next/link";
import { Button } from "@mui/material";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

// 🧩 Main component
export default async function TransfersDataGridPage({
  searchParams,
}: Readonly<{
  searchParams: TransfersSearchParams;
}>) {
  // Fetch transfers data
  const transfers: {
    rows: TransferRow[];
    row_count: number;
  } = await fetchTransferEventsPageData(searchParams);
  if (!transfers || "error" in transfers)
    throw new Error("Failed to retrieve transfers");

  // To get the user's role from the session
  const role = await getSessionRole();
  const rolesAllowedToTransfer = [
    FrontEndRoles.CAS_ANALYST,
    FrontEndRoles.CAS_DIRECTOR,
  ];
  const isAllowedToTransfer = rolesAllowedToTransfer.includes(role);

  // Render the DataGrid component
  return (
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
      <Suspense fallback={<Loading />}>
        <TransferDataGrid initialData={transfers} />
      </Suspense>
    </div>
  );
}
