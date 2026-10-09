import Button from "@mui/material/Button";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

const ViewReportHistoryCell = (params: GridRenderCellParams) => {
  const reportId = params?.row?.report_id;

  const router = useRouter();
  const handleClick = async () => {
    router.push(`report-history/${reportId}`);
  };

  return (
    <Button
      className="w-45 h-10 rounded-[5px] border border-solid border-bc-link-blue"
      color="primary"
      onClick={handleClick}
    >
      View Report History
    </Button>
  );
};

export default ViewReportHistoryCell;
