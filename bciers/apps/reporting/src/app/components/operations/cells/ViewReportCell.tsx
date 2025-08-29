import { BC_GOV_LINKS_COLOR } from "@bciers/styles";
import Button from "@mui/material/Button";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import React from "react";

const ViewReportCell = (params: GridRenderCellParams) => {
  const reportVersionId = params?.row?.report_version_id;

  const router = useRouter();
  const handleClick = async () => {
    router.push(`${reportVersionId}`);
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
      View Report
    </Button>
  );
};

export default ViewReportCell;
