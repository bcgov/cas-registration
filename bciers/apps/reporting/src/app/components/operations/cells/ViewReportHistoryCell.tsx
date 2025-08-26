import { BC_GOV_LINKS_COLOR } from "@bciers/styles";
import Button from "@mui/material/Button";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React from "react";

const ViewReportHistoryCell = (params: GridRenderCellParams) => {
  const reportId = params?.row?.report_id;

  const router = useRouter();
  const handleClick = async () => {
    router.push(`report-history/${reportId}`);
  };

  return (
    <Button
      sx={{
        width: 180,
        height: 40,
        borderRadius: "5px",
        border: `1px solid ${BC_GOV_LINKS_COLOR}`,
      }}
      color="primary"
      onClick={handleClick}
    >
      View Report History
    </Button>
  );
};

export default ViewReportHistoryCell;
