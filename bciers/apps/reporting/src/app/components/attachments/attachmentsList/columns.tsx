import { CloudDownload } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import downloadAttachment from "../download";

const AttachmentDownloadCell = (params: GridRenderCellParams) => {
  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    await downloadAttachment(params.row.report_version_id, params.row.id);
  };

  return (
    <a href="#" onClick={handleDownload} style={{ cursor: "pointer" }}>
      <Stack alignItems="center" direction="row" spacing={1}>
        <span>{params.row.attachment_name}</span>
        <CloudDownload />
      </Stack>
    </a>
  );
};

export const attachmentsGridColumns: GridColDef[] = [
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
