import { CloudDownload } from "@mui/icons-material";
import Button from "@mui/material/Button";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import downloadAttachment from "../download";

const AttachmentDownloadCell = (params: GridRenderCellParams) => {
  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadAttachment(params.row.report_version_id, params.row.id);
  };

  return (
    <Button
      variant="outlined"
      endIcon={<CloudDownload />}
      onClick={handleDownload}
      className="h-10 rounded border border-bc-link-blue"
    >
      {params.row.attachment_name}
    </Button>
  );
};

export const attachmentsGridColumns: GridColDef[] = [
  {
    field: "reporting_year_id",
    headerName: "Reporting Year",
    flex: 1,
  },
  {
    field: "operator",
    headerName: "Operator",
    flex: 1,
  },
  { field: "operation", flex: 1, headerName: "Operation" },
  { field: "report_version_id", flex: 0.5, headerName: "Version ID" },
  { field: "attachment_type", flex: 1, headerName: "Type" },
  {
    field: "attachment_name",
    flex: 1,
    headerName: "Download",
    renderCell: AttachmentDownloadCell,
  },
];
