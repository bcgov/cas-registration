import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Operations from "@/app/components/routes/operations/Operations";
import Loading from "@/app/components/loading/SkeletonGrid";

export default function OperationsPage() {
  return (
    <>
      <h1>Operations List</h1>
      <Link href="/dashboard/operations/0/1">
        <Button variant="contained">Add Operation</Button>
      </Link>
      <Suspense fallback={<Loading />}>
        <Operations />
      </Suspense>
    </>
  );
}
