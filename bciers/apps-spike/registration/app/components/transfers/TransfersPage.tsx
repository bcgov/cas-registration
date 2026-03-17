import TransferDataGrid from "@/registration/app/components/transfers/TransfersDataGrid";
import {
  TransferRow,
  TransfersSearchParams,
} from "@/registration/app/components/transfers/types";
import fetchTransferEventsPageData from "@/registration/app/components/transfers/fetchTransferEventsPageData";

export default async function TransfersPage({
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

  // Render the DataGrid component
  return <TransferDataGrid initialData={transfers} />;
}
