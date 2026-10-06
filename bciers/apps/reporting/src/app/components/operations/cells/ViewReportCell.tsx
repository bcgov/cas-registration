import Button from "@mui/material/Button";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

const ViewReportCell = (params: GridRenderCellParams) => {
  const reportVersionId = params?.row?.report_version_id;

  const router = useRouter();
  const handleClick = async () => {
    router.push(`${reportVersionId}/annual-report`);
  };

  return (
    <Button
      className="w-45 h-10 rounded-[5px] border border-solid border-bc-link-blue"
      color="primary"
      onClick={handleClick}
    >
      View Report
    </Button>
  );
};

export default ViewReportCell;
