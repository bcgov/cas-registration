// import Link from "next/link";
// import { Button } from "@mui/material";
import { Suspense } from "react";
import AccessRequests from "@/app/components/routes/access-requests/AccessRequests";
import Loading from "@/app/components/loading/SkeletonGrid";

export default function Page() {
  return (
    <>
      <h1>Operator Admin Access Requests List</h1>
      {/* <Link href="/dashboard/operations/create">
        <Button variant="contained">Add Operation</Button>
      </Link> */}
      <Suspense fallback={<Loading />}>
        <AccessRequests />
      </Suspense>
    </>
  );
}
