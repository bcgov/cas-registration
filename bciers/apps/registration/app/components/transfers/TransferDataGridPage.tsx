import TransferDataGrid from "./TransferDataGrid";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { TransferRow, TransfersSearchParams } from "./types";
import fetchTransferEventsPageData from "./fetchTransferEventsPageData";

// 🧩 Main component
export default async function TransferDataGridPage({
  searchParams,
}: {
  searchParams: TransfersSearchParams;
}) {
  // Fetch transfers data
  const transfers: {
    rows: TransferRow[];
    row_count: number;
  } = await fetchTransferEventsPageData(searchParams);
  if (!transfers) {
    return <div>No transfers data in database.</div>;
  }

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <TransferDataGrid initialData={transfers} />
      </div>
    </Suspense>
  );
}
