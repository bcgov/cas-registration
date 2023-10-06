import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Operations from "@/components/routes/operations/Operations";
import Loading from "@/components/loading/SkeletonGrid";

export default async function Page() {
  return (
    <>
      <h1>Operations List</h1>
      <Link href="/operations/create">
        <Button variant="contained">Add Operation</Button>
      </Link>
      <Suspense fallback={<Loading />}>
        <Operations />
      </Suspense>
    </>
  );
}
