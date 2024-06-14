import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { FacilitiesSearchParams } from "../../facilities/types";
import Facilities from "../../facilities/Facilities";

export default async function OperationsPage({
  searchParams,
}: Readonly<{ searchParams: FacilitiesSearchParams }>) {
  // ⛔️ hard-coded operationId we need to replace with dynamic data
  const operationId = "e1300fd7-2dee-47d1-b655-2ad3fd10f052";
  return (
    <>
      <Link href="#">
        <Button variant="contained">Add Operation</Button>
      </Link>
      <Suspense fallback={<Loading />}>
        <Facilities operationId={operationId} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
