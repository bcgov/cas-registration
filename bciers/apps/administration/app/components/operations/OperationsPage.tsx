import { OperationsSearchParams } from "./types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Operations from "@/administration/app/components/operations/Operations";

// 🧩 Main component
export default function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <Operations searchParams={searchParams} />
      </div>
    </Suspense>
  );
}
