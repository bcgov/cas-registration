import getAttachmentsList, {
  AttachmentsSearchParams,
} from "../../utils/getAttachmentsList";
import { GridColDef } from "@mui/x-data-grid";
import AttachmentsListGrid from "./AttachmentsListGrid";

export type Attachment = {
  id: number;
  operator: string;
  operation: string;
  report_version_id: number;
  attachment_id: number;
  attachment_type: string;
  attachment_name: string;
};

const columns: GridColDef[] = [
  {
    field: "operator",
    headerName: "Operator",
    flex: 1,
  },
  { field: "operation", flex: 1, headerName: "Operation" },
  { field: "report_version_id", flex: 0.5, headerName: "Version ID" },
  { field: "attachment_type", flex: 1, headerName: "Type" },
  { field: "attachment_name", flex: 1, headerName: "Download" },
];

interface Props {
  searchParams: AttachmentsSearchParams;
}

const AttachmentsListPage: React.FC<Props> = async ({ searchParams }) => {
  const data = await getAttachmentsList(searchParams);

  return (
    <div>
      <h1 className="form-heading-label">
        <label>Attachments:</label>
      </h1>
      <AttachmentsListGrid columns={columns} initialData={data} />
    </div>
  );
};

export default AttachmentsListPage;
