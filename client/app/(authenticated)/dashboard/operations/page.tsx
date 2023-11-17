import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Operations from "@/app/components/routes/operations/Operations";
import Loading from "@/app/components/loading/SkeletonGrid";

export default function Page() {
  return (
    <>
      <h1>Operations List</h1>
      <Link href="/dashboard/operations/create">
        <Button variant="contained">Add Operation</Button>
      </Link>
      <Suspense fallback={<Loading />}>
        <Operations />
      </Suspense>
    </>
  );
}
